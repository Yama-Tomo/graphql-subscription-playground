import React, { Fragment, useState } from 'react';
import { NextPage } from 'next';
import { useMyChannelsQuery, types } from '@/hooks/api';
import { gql } from 'urql';
import { AddChannel, AddChannelProps } from '@/components/AddChannel';
import { Link } from '@/components/Link';
import { pagesPath } from '@/libs/$path';

const Channels: React.FC<Pick<types.MyChannelsQuery, 'channels'>> = (props) => (
  <ul>
    {props.channels.map((channel) => (
      <li key={channel.id}>
        <Link href={pagesPath.channels._id(channel.id).$url()}>
          <a>{channel.name}</a>
        </Link>
      </li>
    ))}
  </ul>
);

type UiProps = types.MyChannelsQuery & {
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
