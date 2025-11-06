import React, { type FC } from 'react';
import {
    WixDesignSystemProvider,
} from '@wix/design-system';
import '@wix/design-system/styles.global.css';
import { i18n } from "@wix/essentials";
import { RecoilRoot } from "recoil";
import { IntercomProvider } from "react-use-intercom";
import StatusToastProvider from "./services/providers/StatusToastProvider";
import { BaseModalProvider } from './services/providers/BaseModalProvider';
import {
    _DEV,
    INTERCOM_APP_ID,
  } from "../constants";

export function withProviders<P extends {} = {}>(Component: React.FC<P>) {
    return function DashboardProviders(props: P) {
        const locale = i18n.getLocale();
        return (
            <WixDesignSystemProvider features={{ newColorsBranding: true }} locale={locale}>
                <RecoilRoot>
                    <IntercomProvider appId={INTERCOM_APP_ID}>
                        <BaseModalProvider>
                            <StatusToastProvider>
                                <Component {...props} />
                            </StatusToastProvider>
                        </BaseModalProvider>
                    </IntercomProvider>
                </RecoilRoot>
            </WixDesignSystemProvider>
        );
    };
};