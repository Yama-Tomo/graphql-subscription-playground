import React, { Fragment } from 'react';
import { NextPage } from 'next';
import { gql } from 'urql';
import { useMyChannelsQuery, MyChannelsQuery } from '@/hooks/api';

const Channels: React.FC<Pick<MyChannelsQuery, 'channels'>> = (props) => (
  <ul>
    {props.channels.map((channel) => (
      <li key={channel.id}>{channel.name}</li>
    ))}
  </ul>
);

const Ui: React.FC<MyChannelsQuery & { loading: boolean }> = ({ channels, loading }) => (
  <main>
    <h1>channels</h1>
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
  const { data, loading } = useMyChannelsQuery();
  const uiProps = { channels: data?.channels || [], loading };
  return <Ui {...uiProps} />;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
