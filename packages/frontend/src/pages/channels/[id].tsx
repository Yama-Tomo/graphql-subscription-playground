import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Channel from '@/pages/channels';
import { Messages } from '@/components/Messages';

const Container: NextPage = (props) => {
  const router = useRouter();

  return (
    <Channel>
      <hr />
      <Messages channelId={String(router.query.id)} />
    </Channel>
  );
};

export default Container;
