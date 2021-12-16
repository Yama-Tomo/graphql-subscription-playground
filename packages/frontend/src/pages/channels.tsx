import React, { Fragment, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { CreateChannel, CreateChannelProps } from '@/components/CreateChannel';
import { ChannelListItem } from '@/components/ChannelListItem';
import { pagesPath } from '@/libs/$path';
import { getDMChannelName } from '@/libs/channel';
import { useMyChannelAndProfileQuery, types, useCreateChannelMutation } from '@/hooks/api';
import { useSearchUsers } from '@/hooks/user';

const Channels: React.FC<
  Pick<types.MyChannelAndProfileQuery, 'channels'> & { myUserId: string }
> = (props) => (
  <ul>
    {props.channels.map((channel) => (
      <ChannelListItem
        key={channel.id}
        id={channel.id}
        name={channel.name}
        isOwner={channel.ownerId === props.myUserId}
        isDM={channel.isDM}
        unReadCount={channel.unReadMessageCount}
      />
    ))}
  </ul>
);

type UiProps = {
  channels: types.MyChannelAndProfileQuery['channels'];
  DMChannels: types.MyChannelAndProfileQuery['channels'];
  myUserId: string;
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
  myUserId,
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
        <Channels channels={channels} myUserId={myUserId} />
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
        {!newDMEditing && <Channels channels={DMChannels} myUserId={myUserId} />}
      </Fragment>
    )}
    {children}
  </main>
);

const Container: NextPage = (props) => {
  const [state, setState] = useState({ newChannelEditing: false, newDMEditing: false });
  const { data: users, search, input, reset } = useSearchUsers();
  const { data, loading, refetch } = useMyChannelAndProfileQuery();
  const [createChannel] = useCreateChannelMutation();
  const router = useRouter();

  useEffect(() => {
    router.events.on('routeChangeStart', () => {
      refetch({ requestPolicy: 'network-only' });
    });
  }, [router, refetch]);

  const uiProps: UiProps = {
    ...props,
    ...state,
    myUserId: data?.myProfile.id || '',
    channels: data?.channels ? data.channels.filter((channel) => !channel.isDM) : [],
    DMChannels: data?.channels
      ? data.channels
          .filter((channel) => channel.isDM)
          .map((channel) => ({ ...channel, name: getDMChannelName(channel, data.myProfile.id) }))
      : [],
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
      search(value);
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
          reset();
        }
      });
    },
    searchUserName: input,
    users: users?.searchUsers
      ? users.searchUsers.filter((user) => user.id != data?.myProfile.id)
      : [],
  };
  return <Ui {...uiProps} />;
};

export default Container;
