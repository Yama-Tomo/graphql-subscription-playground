import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Channel from '@/pages/channels';
import { Messages, MessagesProps } from '@/components/Messages';
import { CreateMessage } from '@/components/CreateMessage';
import { types, useInviteChannelMutation, useMyChannelAndProfileQuery } from '@/hooks/api';
import { useSearchUsers } from '@/hooks/user';
import { getDMChannelName } from '@/libs/channel';

type UiProps = {
  channelId: string;
  isDM: boolean;
  channelName: string;
  newUserEditing: boolean;
  searchUserName: string;
  onSearchUserNameChange: JSX.IntrinsicElements['input']['onChange'];
  users: types.SearchUsersQuery['searchUsers'];
  onSearchUserResultClick: (user: types.SearchUsersQuery['searchUsers'][number]) => void;
  onAddUserClick: () => void;
  onAddUserCancelClick: () => void;
  joinedUserIds: string[];
} & MessagesProps;
const Ui: React.FC<UiProps> = (props) => (
  <Channel>
    <hr style={{ width: '100%' }} />
    <h2>
      # {props.channelName}
      {!props.isDM && (
        <button
          style={{ width: '100px' }}
          onClick={props.newUserEditing ? props.onAddUserCancelClick : props.onAddUserClick}
        >
          {props.newUserEditing ? `cancel` : `add user`}
        </button>
      )}
    </h2>
    {props.newUserEditing && (
      <React.Fragment>
        <input type="text" value={props.searchUserName} onChange={props.onSearchUserNameChange} />
        <ul>
          {props.users.map((user) => (
            <li
              key={user.id}
              onClick={() =>
                !props.joinedUserIds.includes(user.id) && props.onSearchUserResultClick(user)
              }
            >
              {user.name}
              {props.joinedUserIds.includes(user.id) ? ` (joined)` : ``}
            </li>
          ))}
        </ul>
      </React.Fragment>
    )}
    <Messages channelId={props.channelId} myUserId={props.myUserId} />
    <CreateMessage channelId={props.channelId} />
  </Channel>
);

const Container: NextPage = () => {
  const [state, setState] = useState({ newUserEditing: false });
  const router = useRouter();
  const { data } = useMyChannelAndProfileQuery();
  const { data: users, input, search, reset } = useSearchUsers();
  const [invite] = useInviteChannelMutation();

  if (!router.query.id) {
    return null;
  }

  const currentChannel = data && data.channels.find((ch) => ch.id == router.query.id);
  if (!currentChannel) {
    return <div>page not found..</div>;
  }

  const uiProps: UiProps = {
    ...state,
    searchUserName: input,
    channelId: String(router.query.id),
    myUserId: data?.myProfile.id || '',
    isDM: currentChannel.isDM,
    channelName: currentChannel.isDM
      ? getDMChannelName(currentChannel, data.myProfile.id)
      : currentChannel.name,
    users: users ? users.searchUsers.filter((u) => u.id !== data.myProfile.id) : [],
    joinedUserIds: currentChannel.joinUsers.map((u) => u.id),
    onSearchUserResultClick(user) {
      invite({ variables: { id: currentChannel.id, userId: user.id } }).then((res) => {
        if (!res.error && res.data) {
          setState((current) => ({ ...current, newUserEditing: false }));
          reset();
        }
      });
    },
    onSearchUserNameChange({ target: { value } }) {
      search(value);
    },
    onAddUserClick() {
      setState((current) => ({ ...current, newUserEditing: true }));
    },
    onAddUserCancelClick() {
      setState((current) => ({ ...current, newUserEditing: false }));
    },
  };

  return <Ui {...uiProps} />;
};

export default Container;
