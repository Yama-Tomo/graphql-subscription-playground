import React, { Fragment, useState } from 'react';
import { NextPage } from 'next';
import { gql } from 'urql';
import { useMyChannelsQuery, MyChannelsQuery } from '@/hooks/api';
import { AddChannel, AddChannelProps } from '@/components/AddChannel';

const Channels: React.FC<Pick<MyChannelsQuery, 'channels'>> = (props) => (
  <ul>
    {props.channels.map((channel) => (
      <li key={channel.id}>{channel.name}</li>
    ))}
  </ul>
);

type UiProps = MyChannelsQuery & {
  loading: boolean;
  onAddChannelClick: () => void;
  onAddChannelCancelClick: () => void;
  newChannelEditing: boolean;
} & AddChannelProps;
const Ui: React.FC<UiProps> = ({
  channels,
  loading,
  onAddChannelClick,
  onAddChannelCancelClick,
  newChannelEditing,
  onChannelCreated,
}) => (
  <main>
    <h1>
      channels{' '}
      <button onClick={newChannelEditing ? onAddChannelCancelClick : onAddChannelClick}>
        {newChannelEditing ? 'cancel' : 'add'}
      </button>
    </h1>
    {newChannelEditing && <AddChannel onChannelCreated={onChannelCreated} />}
    {loading && <span>loading...</span>}
    {!loading && (
      <Fragment>
        <h2>channels</h2>
        <Channels channels={channels.filter((channel) => !channel.isDM)} />
      </Fragment>
    )}
    {!loading && (
      <Fragment>
        <h2>DM</h2>
        <Channels channels={channels.filter((channel) => channel.isDM)} />
      </Fragment>
    )}
  </main>
);

const Container: NextPage = () => {
  const [state, setState] = useState({ newChannelEditing: false });
  const { data, loading } = useMyChannelsQuery();
  const uiProps: UiProps = {
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

const MyChannels = gql`
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
export { MyChannels };
