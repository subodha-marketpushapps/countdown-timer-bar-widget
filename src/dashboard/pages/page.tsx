import React, { type FC } from 'react';
import { dashboard } from '@wix/dashboard';
import {
  Button,
  EmptyState,
  Image,
  Page,
  TextButton,
} from '@wix/design-system';
import '@wix/design-system/styles.global.css';
import * as Icons from '@wix/wix-ui-icons-common';
import wixLogo from './wix_logo.svg';
import { withProviders } from '../withProviders';
import WidgetBuilder from "./WidgetBuilder/";

const Index: FC = () => {

  const handleBuildFromOnboarding = async () => {

  };

  // Handle navigation to widget builder from overview
  const handleEditFromOverview = async () => {

  };

  // Handle back to overview
  const handleBackToOverview = async () => {

  };
  return (
    <WidgetBuilder
      onBackClicked={handleBackToOverview}
      showAgentPanelFirst={false}
    />
  );
};

export default withProviders(Index);
