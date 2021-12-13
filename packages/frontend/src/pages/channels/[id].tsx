import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Channel from '@/pages/channels';
import { Messages, MessagesProps } from '@/components/Messages';
import { CreateMessage } from '@/components/CreateMessage';
import { useMyChannelAndProfileQuery } from '@/hooks/api';

type UiProps = { channelId: string } & MessagesProps;
const Ui: React.FC<UiProps> = (props) => (
  <Channel>
    <hr style={{ width: '100%' }} />
    <Messages channelId={props.channelId} myUserId={props.myUserId} />
    <CreateMessage channelId={props.channelId} />
  </Channel>
);

const Container: NextPage = () => {
  const router = useRouter();
  const { data } = useMyChannelAndProfileQuery();

  if (!router.query.id) {
    return null;
  }

  const currentChannel = data && data.channels.find((ch) => ch.id == router.query.id);
  if (!currentChannel) {
    return <div>page not found..</div>;
  }

  const uiProps: UiProps = {
    channelId: String(router.query.id),
    myUserId: data?.myProfile.id || '',
  };

  return <Ui {...uiProps} />;
};

export default Container;
