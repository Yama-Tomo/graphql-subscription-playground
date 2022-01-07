import { NextPage } from 'next';
import React from 'react';

import { useRouter } from '@/libs/router';
import Channels, { ChannelsPageProps } from '@/pages/channels.page';

const WithChannelsPage = (Component: React.ComponentType): NextPage => {
  return function WithChannelsPageComponent(props) {
    const router = useRouter();
    const channelPageProps: ChannelsPageProps = {
      ...props,
      activeChId: String(router.query.id),
    };

    return (
      <Channels {...channelPageProps}>
        <Component />
      </Channels>
    );
  };
};

export { WithChannelsPage };
