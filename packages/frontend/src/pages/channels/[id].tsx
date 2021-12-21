import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Box, Heading, IconButton } from '@chakra-ui/react';
import Channel from '@/pages/channels';
import { Messages, MessagesProps } from '@/components/Messages';
import { CreateMessage } from '@/components/CreateMessage';
import { SearchUserModal, SearchUserModalProps } from '@/components/SearchUserModal';
import { PersonAdd } from '@/components/Icons';
import { useInviteChannelMutation, useMyChannelAndProfileQuery } from '@/hooks/api';
import { getDMChannelName } from '@/libs/channel';

type UiProps = {
  channelId: string;
  isDM: boolean;
  channelName: string;
  inviteUserEditing: boolean;
  onAddUserClick: () => void;
  onAddUserCancelClick: () => void;
} & MessagesProps &
  Pick<SearchUserModalProps, 'renderUserName' | 'onSearchResultClick'>;
const Ui: React.FC<UiProps> = (props) => (
  <Channel activeChId={props.channelId}>
    <hr style={{ width: '100%' }} />
    <Box p={2} color={'gray.700'} boxShadow="md">
      <Heading mt={4} size={'md'} display={'flex'} alignItems={'center'}>
        <Box># {props.channelName}</Box>
        {!props.isDM && (
          <IconButton
            ml={4}
            aria-label="add user"
            icon={<PersonAdd />}
            size={'xs'}
            onClick={props.onAddUserClick}
          />
        )}
      </Heading>
    </Box>
    {props.inviteUserEditing && (
      <SearchUserModal
        onClose={props.onAddUserCancelClick}
        myUserId={props.myUserId}
        modalTitle={'invite user'}
        onSearchResultClick={props.onSearchResultClick}
        renderUserName={props.renderUserName}
      />
    )}
    <Messages channelId={props.channelId} myUserId={props.myUserId} />
    <CreateMessage channelId={props.channelId} />
  </Channel>
);

const Container: NextPage = () => {
  const [state, setState] = useState({ inviteUserEditing: false });
  const router = useRouter();
  const { data, error } = useMyChannelAndProfileQuery();
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
    channelId: String(router.query.id),
    myUserId: data?.myProfile.id || '',
    isDM: currentChannel.isDM,
    channelName: currentChannel.isDM
      ? getDMChannelName(currentChannel, data.myProfile.id)
      : currentChannel.name,
    onSearchResultClick(user) {
      invite({ variables: { id: currentChannel.id, userId: user.id } });
    },
    onAddUserClick() {
      setState((current) => ({ ...current, inviteUserEditing: true }));
    },
    onAddUserCancelClick() {
      setState((current) => ({ ...current, inviteUserEditing: false }));
    },
    renderUserName(user) {
      const isJoined = currentChannel.joinUsers.find((usr) => usr.id === user.id);
      return (
        <>
          {user.name}
          {isJoined && ` (joined)`}
        </>
      );
    },
  };

  return <Ui {...uiProps} />;
};

export default Container;
