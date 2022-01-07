import { Box } from '@chakra-ui/react';
import { NextPage } from 'next';
import React, { useCallback } from 'react';

import { Channels, ChannelsProps } from '@/components/Channels';
import { pagesPath } from '@/libs/$path';
import { useRouter } from '@/libs/router';

type UiProps = Omit<ChannelsProps, 'sideNavStyle'>;
const Ui: React.FC<UiProps> = ({ children, ...rest }) => (
  <>
    <Box display={{ base: 'none', md: 'block' }}>
      <Channels
        {...rest}
        sideNavStyle={{
          padding: 2,
          w: '170px',
          height: 'calc(100vh - 5.75rem)',
          overflowY: 'auto',
          position: 'sticky',
          borderRight: '1px solid',
          borderColor: 'gray.200',
          top: '64px',
        }}
      />
    </Box>
    <Box flex="1" display={'flex'} flexDirection={'column'}>
      {children}
    </Box>
  </>
);

type ContainerProps = Pick<UiProps, 'activeChId'>;
const Container: NextPage<ContainerProps> = (props) => {
  const router = useRouter();

  const gotoChannel = (id: string) => router.push(pagesPath.channels._id(id).$url());

  const uiProps: UiProps = {
    ...props,
    addReFetchEventListener: useCallback(
      (handler) => {
        router.events.on('routeChangeStart', handler);
      },
      [router]
    ),
    removeReFetchEventListener: useCallback(
      (handler) => {
        router.events.off('routeChangeStart', handler);
      },
      [router]
    ),
    onChannelCreated: gotoChannel,
    onDMChannelCreated: gotoChannel,
  };
  return <Ui {...uiProps} />;
};

export default Container;
export type { ContainerProps as ChannelsPageProps };
