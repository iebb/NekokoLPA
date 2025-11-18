import React, { PropsWithChildren, ReactNode } from 'react';
import SafeScreen from '@/theme/SafeScreen';
import Title from '@/components/common/Title';
import PageContainer from '@/components/common/PageContainer';

type ScreenProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
  horizontalPadding?: number;
  keyboardAvoiding?: boolean;
  scrollViewProps?: any;
  fixedHeader?: ReactNode;
}>;

export default function Screen({
  title,
  subtitle,
  horizontalPadding,
  keyboardAvoiding,
  scrollViewProps,
  fixedHeader,
  children,
}: ScreenProps) {
  return (
    <SafeScreen>
      {title ? <Title subtitle={subtitle}>{title}</Title> : null}
      {fixedHeader}
      <PageContainer
        horizontalPadding={horizontalPadding}
        keyboardAvoiding={keyboardAvoiding}
        scrollViewProps={scrollViewProps}
        topPadding={subtitle && subtitle.trim().length > 0 ? 20 : 0}
      >
        <>{children}</>
      </PageContainer>
    </SafeScreen>
  );
}


