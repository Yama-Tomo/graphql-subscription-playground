import React, { Fragment, useEffect, useState } from 'react';
import { NextPage } from 'next';
import {
  useMyChannelsQuery,
  types,
  useSearchUsersQuery,
  useCreateChannelMutation,
} from '@/hooks/api';
import { gql } from 'urql';
import { CreateChannel, CreateChannelProps } from '@/components/CreateChannel';
import { ChannelListItem } from '@/components/ChannelListItem';
import { useRouter } from 'next/router';
import { pagesPath } from '@/libs/$path';

const Channels: React.FC<Pick<types.MyChannelsQuery, 'channels'>> = (props) => (
  <ul>
    {props.channels.map((channel) => (
      // TODO: isOwnerはあとで
      <ChannelListItem
        key={channel.id}
        id={channel.id}
        name={channel.name}
        isOwner={true}
        isDM={channel.isDM}
      />
    ))}
  </ul>
);

type UiProps = {
  channels: types.MyChannelsQuery['channels'];
  DMChannels: types.MyChannelsQuery['channels'];
  loading: boolean;
  onAddChannelClick: () => void;
  onAddChannelCancelClick: () => void;
  newChannelEditing: boolean;
  onAddDMClick: () => void;
  onAddDMCancelClick: () => void;
  newDMEditing: boolean;
  searchUserName: JSX.IntrinsicElements['input']['value'];
  onSearchUserNameChange: JSX.IntrinsicElements['input']['onChange'];
  onUserClick: (user: types.SearchUsersQuery['searchUsers'][number]) => void;
  users: types.SearchUsersQuery['searchUsers'];
} & CreateChannelProps;
const Ui: React.FC<UiProps> = ({
  channels,
  DMChannels,
  loading,
  onAddChannelClick,
  onAddChannelCancelClick,
  newChannelEditing,
  onChannelCreated,
  onAddDMClick,
  onAddDMCancelClick,
  newDMEditing,
  searchUserName,
  onSearchUserNameChange,
  onUserClick,
  users,
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
        <Channels channels={channels} />
      </Fragment>
    )}
    {!loading && (
      <Fragment>
        <h2>
          DM
          <button onClick={newDMEditing ? onAddDMCancelClick : onAddDMClick}>
            {newDMEditing ? 'cancel' : 'add'}
          </button>
        </h2>
        {newDMEditing && (
          <React.Fragment>
            <input type="text" value={searchUserName} onChange={onSearchUserNameChange} />
            <ul>
              {users.map((user) => (
                <li key={user.id} onClick={() => onUserClick(user)}>
                  {user.name}
                </li>
              ))}
            </ul>
          </React.Fragment>
        )}
        {!newDMEditing && <Channels channels={DMChannels} />}
      </Fragment>
    )}
    {children}
  </main>
);

const Container: NextPage = (props) => {
  const [state, setState] = useState({ newChannelEditing: false, newDMEditing: false });
  const [searchVars, setSearchVars] = useState({ name: '' });
  const { data, loading } = useMyChannelsQuery();
  const { data: users, refetch } = useSearchUsersQuery({
    variables: searchVars,
    skip: true,
  });
  const [createChannel] = useCreateChannelMutation();
  const router = useRouter();

  useEffect(() => {
    if (!searchVars.name) {
      return;
    }

    const timeout = setTimeout(refetch, 300);
    return function cancelExecuteSearch() {
      clearTimeout(timeout);
    };
  }, [refetch, searchVars.name]);

  const uiProps: UiProps = {
    ...props,
    ...state,
    channels: data?.channels ? data.channels.filter((channel) => !channel.isDM) : [],
    DMChannels: data?.channels ? data.channels.filter((channel) => channel.isDM) : [],
    loading,
    onAddChannelClick: () => {
      setState((current) => ({ ...current, newChannelEditing: true }));
    },
    onAddChannelCancelClick: () => {
      setState((current) => ({ ...current, newChannelEditing: false }));
    },
    onChannelCreated: () => {
      setState((current) => ({ ...current, newChannelEditing: false }));
    },
    onAddDMClick: () => {
      setState((current) => ({ ...current, newDMEditing: true }));
    },
    onAddDMCancelClick: () => {
      setState((current) => ({ ...current, newDMEditing: false }));
    },
    onSearchUserNameChange: ({ target: { value } }) => {
      setSearchVars((current) => ({ ...current, name: value }));
    },
    onUserClick: (user) => {
      if (!data) {
        return;
      }

      const existsDM = data.channels.find(
        (channel) => channel.isDM && channel.joinUsers.find((u) => u.id == user.id)
      );
      if (existsDM) {
        setState((current) => ({ ...current, newDMEditing: false }));
        router.push(pagesPath.channels._id(existsDM.id).$url());
        return;
      }

      const channelName = [data.myProfile.name, user.name].join(', ');
      createChannel({
        variables: { name: channelName, description: '', isDM: true, joinUsers: [user.id] },
      }).then((res) => {
        if (!res.error && res.data) {
          setState((current) => ({ ...current, newDMEditing: false }));
        }
      });
    },
    searchUserName: searchVars.name,
    users: users?.searchUsers
      ? users.searchUsers.filter((user) => user.id != data?.myProfile.id)
      : [],
  };
  return <Ui {...uiProps} />;
};

gql`
  query MyChannels {
    channels {
      id
      name
      isDM
      joinUsers {
        id
        name
      }
      ownerId
    }
    myProfile {
      id
      name
    }
  }
`;

gql`
  query SearchUsers($name: String!) {
    searchUsers(name: $name) {
      id
      name
    }
  }
`;

export default Container;
