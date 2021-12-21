import React, { useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { pagesPath } from '@/libs/$path';
import { useMyChannelAndProfileQuery } from '@/hooks/api';
import { Channels, ChannelsProps } from '@/components/Channels';

type ContainerProps = Pick<ChannelsProps, 'activeChId'>;
const Container: NextPage<ContainerProps> = (props) => {
  const { data, loading, refetch } = useMyChannelAndProfileQuery();
  const router = useRouter();

  useEffect(() => {
    router.events.on('routeChangeStart', () => {
      refetch({ requestPolicy: 'network-only' });
    });
  }, [router, refetch]);

  const gotoChannel = (id: string) => router.push(pagesPath.channels._id(id).$url());

  const channelsProps: ChannelsProps = {
    ...props,
    myUserId: data?.myProfile.id || '',
    channels: data?.channels ? data.channels.filter((channel) => !channel.isDM) : [],
    DMChannels: data?.channels ? data.channels.filter((channel) => channel.isDM) : [],
    loading,
    sideNavStyle: {
      padding: 2,
      w: '170px',
      height: 'calc(100vh - 8.125rem)',
      overflowY: 'auto',
      position: 'sticky',
      borderRight: '1px solid',
      borderColor: 'gray.300',
      top: '64px',
    },
    onChannelCreated: gotoChannel,
    onDMChannelCreated: gotoChannel,
  };
  return <Channels {...channelsProps} />;
};

export default Container;
