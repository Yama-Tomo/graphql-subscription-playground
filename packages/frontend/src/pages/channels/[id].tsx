import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Channel from '@/pages/channels';
import { Messages } from '@/components/Messages';
import { CreateMessage } from '@/components/CreateMessage';

const Ui: React.FC<{ channelId: string }> = (props) => (
  <Channel>
    <hr />
    <Messages channelId={props.channelId} />
    <CreateMessage channelId={props.channelId} />
  </Channel>
);

const Container: NextPage = () => {
  const router = useRouter();

  if (!router.query.id) {
    return null;
  }

  const uiProps = {
    channelId: String(router.query.id),
  };

  return <Ui {...uiProps} />;
};

export default Container;
