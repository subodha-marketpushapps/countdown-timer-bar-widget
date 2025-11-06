import React from "react";
import {
  Box,
  FormField,
  Palette,
  Text,
  Layout,
  Cell,
  Thumbnail,
} from "@wix/design-system";
import { WidgetStyles } from "../../../../../interfaces";
import * as THEMES_DATA from "./widgetThemes.js";

interface SubPanelThemesProps {
  options: Record<string, any>;
  onChange: (options: Record<string, any>) => void;
}

const SubPanelThemes: React.FC<SubPanelThemesProps> = ({
  options,
  onChange,
}) => {
  const generatePalette = (styles: Partial<WidgetStyles>) => {
    const listOfLimitedKeys = [
      "D_Header_BackgroundColor",
      "D_Content_BackgroundColor",
      "D_Text_HighEmphasisColor",
      "D_Btn_BackgroundColor",
    ];
    const colorKeys = listOfLimitedKeys.filter((key) => key in styles);
    const colors = colorKeys.map((key) => styles[key as keyof WidgetStyles]);
    return colors;
  };

  const customTheme = {
    id: 0,
    name: "Custom",
    colors: generatePalette({ ...options }),
  };

  const themes = [
    {
      id: 1,
      name: "Pure Light",
      colors: generatePalette(THEMES_DATA.themeLight),
      themeStyles: THEMES_DATA.themeLight,
    },
    {
      id: 2,
      name: "Default Green",
      colors: generatePalette(THEMES_DATA.themeDefaultGreen),
      themeStyles: THEMES_DATA.themeDefaultGreen,
    },
    {
      id: 3,
      name: "Dark Green",
      colors: generatePalette(THEMES_DATA.themeDarkGreen),
      themeStyles: THEMES_DATA.themeDarkGreen,
    },
    {
      id: 4,
      name: "Dark",
      colors: generatePalette(THEMES_DATA.themeDark),
      themeStyles: THEMES_DATA.themeDark,
    },
    {
      id: 5,
      name: "Blue",
      colors: generatePalette(THEMES_DATA.themeBlue),
      themeStyles: THEMES_DATA.themeBlue,
    },
  ];

  // Returns true if all keys in themeStyles match the current options
  const isSelectedTheme = (themeStyles: Partial<WidgetStyles>) => {
    return Object.keys(themeStyles).every(
      (key) =>
        options[key as keyof WidgetStyles] ===
        themeStyles[key as keyof WidgetStyles]
    );
  };

  // Returns true if none of the featured themes match the current options
  const isCustomTheme = () => {
    return !themes.some((theme) => {
      return Object.keys(theme.themeStyles).every(
        (key) =>
          options[key as keyof WidgetStyles] ===
          theme.themeStyles[key as keyof WidgetStyles]
      );
    });
  };

  return (
    <Layout gap="12px">
      {isCustomTheme() && (
        <Cell span={12}>
          <Text>Current theme</Text>
          <Thumbnail
            selected={true}
            onClick={(e) =>
              onChange({
                ...options,
                D_Widget_Theme: e.currentTarget.id,
              })
            }
          >
            <Box padding="12px" direction="vertical">
              <FormField>
                <Box height="24px">
                  <Palette fill={customTheme.colors} />
                </Box>
              </FormField>
            </Box>
          </Thumbnail>
        </Cell>
      )}
      <Cell span={12}>
        <Box>
          <Text>Featured themes</Text>
        </Box>
      </Cell>
      {themes.map((theme) => (
        <Cell key={theme.id} span={12}>
          <Thumbnail
            selected={isSelectedTheme(theme.themeStyles)}
            onClick={() =>
              onChange({
                ...options,
                D_Widget_Theme: theme.name,
                ...theme.themeStyles,
              })
            }
          >
            <Box padding="12px" direction="vertical">
              <FormField label={theme.name}>
                <Box height="24px">
                  <Palette fill={theme.colors} />
                </Box>
              </FormField>
            </Box>
          </Thumbnail>
        </Cell>
      ))}
    </Layout>
  );
};

export default SubPanelThemes;
