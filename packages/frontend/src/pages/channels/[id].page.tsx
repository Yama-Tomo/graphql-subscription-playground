import { Box, Flex, Heading, IconButton, Tag } from '@chakra-ui/react';
import { NextPage } from 'next';
import React, { useState } from 'react';

import { CreateMessage } from '@/components/CreateMessage';
import { DrawerMenu, DrawerMenuProps } from '@/components/DrawerMenu';
import { PersonAdd } from '@/components/Icons';
import { Messages, MessagesProps } from '@/components/Messages';
import { SearchUserModal, SearchUserModalProps } from '@/components/SearchUserModal';
import { WithChannelsPage } from '@/components/WithChannelsPage';
import { useInviteChannelMutation, useMyChannelAndProfileQuery } from '@/hooks/api';
import { pagesPath } from '@/libs/$path';
import { getDMChannelName } from '@/libs/channel';
import { useRouter } from '@/libs/router';

type UiProps = {
  channelId: string;
  isDM: boolean;
  channelName: string;
  description: string;
  joinedUserCount: number;
  inviteUserEditing: boolean;
  onAddUserClick: () => void;
  onAddUserCancelClick: () => void;
} & MessagesProps &
  Pick<SearchUserModalProps, 'renderUserName' | 'onSearchResultClick'> &
  DrawerMenuProps;
const Ui: React.FC<UiProps> = (props) => (
  <>
    <Flex p={2} color={'gray.700'} boxShadow="md" alignItems={'center'}>
      <Heading mt={2} mb={2} size={'md'} display={'flex'} alignItems={'center'}>
        <Box display={{ base: 'inline', md: 'none' }} me={1.5}>
          <DrawerMenu
            buttonStyleProps={{ size: 'sm' }}
            activeChId={props.activeChId}
            addReFetchEventListener={props.addReFetchEventListener}
            removeReFetchEventListener={props.removeReFetchEventListener}
            onChannelCreated={props.onChannelCreated}
            onDMChannelCreated={props.onDMChannelCreated}
          />
        </Box>
        <Box># {props.channelName}</Box>
        {!props.isDM && (
          <>
            <IconButton
              ml={2}
              aria-label="add user"
              icon={<PersonAdd />}
              size={'xs'}
              onClick={props.onAddUserClick}
            />
          </>
        )}
      </Heading>
      {props.description && (
        <Box fontWeight={'light'} color={'gray.700'} fontSize={'xs'} ms={4}>
          {props.description}
        </Box>
      )}
      <Box flex={1} textAlign={'right'} fontSize={'xs'}>
        <Tag fontSize={'xs'} colorScheme={'teal'}>
          {props.joinedUserCount} users
        </Tag>
      </Box>
    </Flex>
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
  </>
);

const Container: NextPage = () => {
  const [state, setState] = useState({ inviteUserEditing: false });
  const router = useRouter();
  const { data } = useMyChannelAndProfileQuery();
  const [invite] = useInviteChannelMutation();

  if (!router.query.id) {
    return null;
  }

  const currentChannel = data && data.channels.find((ch) => ch.id == router.query.id);
  if (!currentChannel) {
    return <div>page not found..</div>;
  }

  const gotoChannel = (id: string) => router.push(pagesPath.channels._id(id).$url());

  const uiProps: UiProps = {
    ...state,
    channelId: currentChannel.id,
    activeChId: currentChannel.id,
    myUserId: data?.myProfile.id || '',
    isDM: currentChannel.isDM,
    channelName: currentChannel.isDM
      ? getDMChannelName(currentChannel, data.myProfile.id)
      : currentChannel.name,
    description: currentChannel.description ?? '',
    joinedUserCount: currentChannel.joinUsers.length,
    onSearchResultClick(user) {
      invite({ variables: { id: currentChannel.id, userId: user.id } });
    },
    onAddUserClick() {
      setState((current) => ({ ...current, inviteUserEditing: true }));
    },
    onAddUserCancelClick() {
      setState((current) => ({ ...current, inviteUserEditing: false }));
    },
    onChannelCreated: gotoChannel,
    onDMChannelCreated: gotoChannel,
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

export default WithChannelsPage(Container);
