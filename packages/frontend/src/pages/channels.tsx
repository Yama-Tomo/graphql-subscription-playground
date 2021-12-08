import React, { Fragment, useState } from 'react';
import { NextPage } from 'next';
import { useMyChannelsQuery, types } from '@/hooks/api';
import { gql } from 'urql';
import { CreateChannel, CreateChannelProps } from '@/components/CreateChannel';
import { ChannelListItem } from '@/components/ChannelListItem';

const Channels: React.FC<Pick<types.MyChannelsQuery, 'channels'>> = (props) => (
  <ul>
    {props.channels.map((channel) => (
      // TODO: isOwnerはあとで
      <ChannelListItem key={channel.id} id={channel.id} name={channel.name} isOwner={true} />
    ))}
  </ul>
);

type UiProps = types.MyChannelsQuery & {
  loading: boolean;
  onAddChannelClick: () => void;
  onAddChannelCancelClick: () => void;
  newChannelEditing: boolean;
} & CreateChannelProps;
const Ui: React.FC<UiProps> = ({
  channels,
  loading,
  onAddChannelClick,
  onAddChannelCancelClick,
  newChannelEditing,
  onChannelCreated,
  children,
}) => (
  <main style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
    {loading && <span>loading...</span>}
    {!loading && (
      <Fragment>
        <h2>
          channels
          <button onClick={newChannelEditing ? onAddChannelCancelClick : onAddChannelClick}>
            {newChannelEditing ? 'cancel' : 'add'}
          </button>
        </h2>
        {newChannelEditing && <CreateChannel onChannelCreated={onChannelCreated} />}
        <Channels channels={channels.filter((channel) => !channel.isDM)} />
      </Fragment>
    )}
    {!loading && (
      <Fragment>
        <h2>DM</h2>
        <Channels channels={channels.filter((channel) => channel.isDM)} />
      </Fragment>
    )}
    {children}
  </main>
);

const Container: NextPage = (props) => {
  const [state, setState] = useState({ newChannelEditing: false });
  const { data, loading } = useMyChannelsQuery();
  const uiProps: UiProps = {
    ...props,
    channels: data?.channels || [],
    loading,
    newChannelEditing: state.newChannelEditing,
    onAddChannelClick: () => {
      setState((current) => ({ ...current, newChannelEditing: true }));
    },
    onAddChannelCancelClick: () => {
      setState((current) => ({ ...current, newChannelEditing: false }));
    },
    onChannelCreated: () => {
      setState((current) => ({ ...current, newChannelEditing: false }));
    },
  };
  return <Ui {...uiProps} />;
};

gql`
  query MyChannels {
    channels {
      id
      name
      isDM
      ownerId
    }
  }
`;

export default Container;
