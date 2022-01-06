import { Box } from '@chakra-ui/react';
import { NextPage } from 'next';
import React, { useEffect } from 'react';

import { Channels, ChannelsProps } from '@/components/Channels';
import { pagesPath } from '@/libs/$path';
import { useRouter } from '@/libs/router';

type UiProps = Omit<ChannelsProps, 'sideNavStyle'>;
const Ui: React.FC<UiProps> = ({ children, ...rest }) => (
  <>
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
  </>
);

type ContainerProps = Pick<UiProps, 'activeChId'>;
const Container: NextPage<ContainerProps> = (props) => {
  const router = useRouter();

  useEffect(() => {
    router.events.on('routeChangeStart', () => {
      refetch({ requestPolicy: 'network-only' });
    });
  }, [router, refetch]);

  const gotoChannel = (id: string) => router.push(pagesPath.channels._id(id).$url());

  const uiProps: UiProps = {
    ...props,
    onChannelCreated: gotoChannel,
    onDMChannelCreated: gotoChannel,
  };
  return <Ui {...uiProps} />;
};

export default Container;
