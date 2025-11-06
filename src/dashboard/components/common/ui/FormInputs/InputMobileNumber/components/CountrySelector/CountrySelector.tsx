import React, { useState, useEffect } from "react";
import { AutoComplete, Input, listItemSelectBuilder } from "@wix/design-system";
import * as Icons from "@wix/wix-ui-icons-common";
import metadata from "libphonenumber-js/metadata.min.json";

import { useWixLocationDetection } from "../../hooks/useWixLocationDetection";
import { includesCaseInsensitive } from "../../utils";
import { getCountryName } from "../../constants/countries";
import { STORAGE_KEYS, DEBUG_PREFIXES } from "../../InputMobileNumber.constants";
import type {
  CountrySelectorProps,
  CountryOption,
  AutoCompleteCountryOption,
} from "../../InputMobileNumber.types";

/**
 * Generates country options for dropdown
 * @returns Array of country options with proper formatting
 */
const getCountryOptions = (): AutoCompleteCountryOption[] => {
  const countries = Object.entries(metadata.countries);
  return countries.map(([countryCode, countryData]) => {
    const callingCode = countryData[0];
    const countryName = getCountryName(countryCode);

    const baseOption = listItemSelectBuilder({
      id: countryCode,
      title: `${countryCode} (+${callingCode})`,
      subtitle: countryName,
      label: `${countryName} ${countryCode} +${callingCode}`,
    });

    return {
      ...baseOption,
      phoneCode: `+${callingCode}`,
    } as AutoCompleteCountryOption;
  });
};

// Memoize options to prevent recreation on every render
const COUNTRY_OPTIONS = getCountryOptions();

/**
 * CountrySelector component for selecting countries with intelligent detection
 *
 * Features:
 * - Automatic location detection
 * - Search functionality
 * - Keyboard navigation
 * - Proper error handling
 */
export const CountrySelector: React.FC<CountrySelectorProps> = ({
  onSelect,
  value,
  enableLocationDetection = true,
  defaultCountry = "US",
  disabled = false,
  size = "medium",
  debug = false,
  dataTestId = "country-selector",
}) => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string | undefined>(value);
  const [lastValidSelection, setLastValidSelection] = useState<string>("");
  const [lastValidOption, setLastValidOption] = useState<AutoCompleteCountryOption | null>(null);

  // Location detection hook
  const locationDetection = useWixLocationDetection({
    defaultCountry,
    enabled: enableLocationDetection,
    debug,
  });

  // Handle initial value
  useEffect(() => {
    if (value) {
      const initialOption = COUNTRY_OPTIONS.find((option) => option.id === value);
      if (initialOption) {
        setSearchValue(value);
        setSelectedId(value);
        setLastValidSelection(value);
        setLastValidOption(initialOption);
      }
    }
  }, [value]);

  // Handle location detection
  useEffect(() => {
    if (
      locationDetection.country &&
      locationDetection.method !== "default" &&
      !searchValue &&
      !lastValidOption &&
      !value
    ) {
      const detectedOption = COUNTRY_OPTIONS.find(
        (option) => option.id === locationDetection.country,
      );

      if (detectedOption) {
        setSearchValue(detectedOption.id as string);
        setSelectedId(detectedOption.id as string);
        setLastValidSelection(detectedOption.id as string);
        setLastValidOption(detectedOption);
        onSelect(detectedOption);

        if (debug) {
          console.log(`${DEBUG_PREFIXES.COUNTRY_SELECTOR} Auto-detected:`, {
            country: detectedOption.id,
            method: locationDetection.method,
            name: detectedOption.subtitle,
          });
        }
      }
    }
  }, [
    locationDetection.country,
    locationDetection.method,
    searchValue,
    lastValidOption,
    onSelect,
    value,
    debug,
  ]);

  const getPlaceholderText = () => {
    if (value || lastValidOption) {
      return "Search country";
    }

    if (locationDetection.isLoading) {
      return "🔍 Detecting location...";
    }

    switch (locationDetection.method) {
      case "site-properties":
        return "🏢 Business location detected";
      case "business-location":
        return "📍 Location detected";
      case "locale-fallback":
        return "🌐 Site location detected";
      default:
        return "Search country";
    }
  };

  const getFilteredOptions = () => {
    if (!searchValue.trim()) return COUNTRY_OPTIONS;
    return COUNTRY_OPTIONS.filter((option) =>
      includesCaseInsensitive(option.label, searchValue.trim()),
    );
  };

  const handleBlur = () => {
    const trimmedSearch = searchValue.trim();
    
    // If search is empty, revert to last valid
    if (!trimmedSearch) {
      revertToLastValid();
      return;
    }

    // Priority 1: Exact ID match (e.g., "LK", "US")
    const exactIdMatch = COUNTRY_OPTIONS.find(
      (option) => option.id?.toLowerCase() === trimmedSearch.toLowerCase(),
    );

    if (exactIdMatch) {
      selectOption(exactIdMatch);
      return;
    }

    // Priority 2: Exact label match (e.g., "Sri Lanka LK +94")
    const exactLabelMatch = COUNTRY_OPTIONS.find(
      (option) => option.label?.toLowerCase() === trimmedSearch.toLowerCase(),
    );

    if (exactLabelMatch) {
      selectOption(exactLabelMatch);
      return;
    }

    // Priority 3: Exact country name match (e.g., "Sri Lanka")
    const exactNameMatch = COUNTRY_OPTIONS.find(
      (option) => option.subtitle?.toLowerCase() === trimmedSearch.toLowerCase(),
    );

    if (exactNameMatch) {
      selectOption(exactNameMatch);
      return;
    }

    // Priority 4: If user has a clear single result from filtering, use it
    const filteredOptions = getFilteredOptions();
    if (filteredOptions.length === 1) {
      selectOption(filteredOptions[0]);
      return;
    }

    // Priority 5: If few results and first one starts with search term, select it
    if (filteredOptions.length > 0 && filteredOptions.length <= 3) {
      const startsWithMatch = filteredOptions.find(
        (option) =>
          option.subtitle?.toLowerCase().startsWith(trimmedSearch.toLowerCase()) ||
          option.id?.toLowerCase().startsWith(trimmedSearch.toLowerCase()),
      );
      
      if (startsWithMatch) {
        selectOption(startsWithMatch);
        return;
      }
    }

    // Otherwise, revert to last valid selection
    revertToLastValid();
  };

  const selectOption = (option: AutoCompleteCountryOption) => {
    onSelect(option);
    setSearchValue(option.id as string);
    setSelectedId(option.id as string);
    setLastValidSelection(option.id as string);
    setLastValidOption(option);
    
    if (debug) {
      console.log(`${DEBUG_PREFIXES.COUNTRY_SELECTOR} Selected:`, {
        country: option.id,
        name: option.subtitle,
        phoneCode: option.phoneCode,
      });
    }
  };

  const revertToLastValid = () => {
    if (lastValidOption) {
      setSearchValue(lastValidOption.id as string);
      setSelectedId(lastValidOption.id as string);
      onSelect(lastValidOption);
      
      if (debug) {
        console.log(`${DEBUG_PREFIXES.COUNTRY_SELECTOR} Reverted to last valid:`, {
          country: lastValidOption.id,
          name: lastValidOption.subtitle,
        });
      }
    } else {
      // No valid selection yet, clear everything
      setSearchValue("");
      setSelectedId(undefined);
      onSelect(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const trimmedSearch = searchValue.trim();
      
      // Priority 1: Exact ID match
      const exactIdMatch = COUNTRY_OPTIONS.find(
        (option) => option.id?.toLowerCase() === trimmedSearch.toLowerCase(),
      );
      
      if (exactIdMatch) {
        selectOption(exactIdMatch);
        e.preventDefault();
        return;
      }
      
      // Priority 2: First filtered option
      const filteredOptions = getFilteredOptions();
      if (filteredOptions.length > 0) {
        selectOption(filteredOptions[0]);
        e.preventDefault();
      }
    } else if (e.key === "Escape") {
      revertToLastValid();
      e.preventDefault();
    }
  };

  return (
    <div data-testid={dataTestId} style={{ maxWidth: "140px", minWidth: "93px" }}>
      <AutoComplete
        placeholder={getPlaceholderText()}
        maxHeightPixels="300px"
        value={searchValue}
        selectedId={selectedId}
        options={COUNTRY_OPTIONS}
        status={locationDetection.isLoading ? "loading" : undefined}
        border="standard"
        clearButton={false}
        disabled={disabled}
        size={size}
        onSelect={(option) => {
          const selectedOption = COUNTRY_OPTIONS.find(
            (opt) => opt.id === option.id,
          ) as CountryOption;

          if (selectedOption) {
            if (debug) {
              console.log(`${DEBUG_PREFIXES.COUNTRY_SELECTOR} AutoComplete onSelect:`, {
                optionId: option.id,
                country: selectedOption.id,
                name: selectedOption.subtitle,
              });
            }
            
            selectOption(selectedOption as AutoCompleteCountryOption);
            localStorage.setItem(STORAGE_KEYS.USER_PREFERRED_COUNTRY, selectedOption.id as string);
          }
        }}
        onChange={(e) => setSearchValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        predicate={(option) => includesCaseInsensitive(option.label || "", searchValue.trim())}
        prefix={
          <Input.IconAffix>
            <Icons.Languages />
          </Input.IconAffix>
        }
        popoverProps={{ appendTo: "window" }}
        dropdownWidth="180px"
      />
    </div>
  );
};
