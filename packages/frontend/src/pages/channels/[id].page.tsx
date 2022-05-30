import { Box, Flex, Heading, IconButton, Tag } from '@chakra-ui/react';
import { NextPage } from 'next';
import React, { useRef, useState } from 'react';
import { gql } from 'urql';

import { CreateMessage } from '@/components/CreateMessage';
import { DrawerMenu, DrawerMenuProps } from '@/components/DrawerMenu';
import { PersonAdd } from '@/components/Icons';
import { Messages, MessagesContext, MessagesContextType } from '@/components/Messages';
import { SearchUserModal, SearchUserModalProps } from '@/components/SearchUserModal';
import {
  useInviteChannelMutation,
  ChannelIdPageDocument,
  typedFilter,
  useQuery,
  MessagesDocument,
} from '@/hooks/api';
import { pagesPath } from '@/libs/$path';
import { getDMChannelName } from '@/libs/channel';
import { useRouter } from '@/libs/router';
import { ChannelsPageUi, ChannelsPageUiProps } from '@/pages/channels.page';

type UiProps = {
  channelId: string;
  isDM: boolean;
  channelName: string;
  description: string;
  joinedUserCount: number;
  inviteUserEditing: boolean;
  onAddUserClick: () => void;
  onAddUserCancelClick: () => void;
  drawerMenuProps: DrawerMenuProps;
  channelsPageUiProps: ChannelsPageUiProps;
} & Pick<SearchUserModalProps, 'renderUserName' | 'onSearchResultClick'>;
const Ui: React.FC<UiProps> = (props) => (
  <ChannelsPageUi {...props.channelsPageUiProps}>
    <Flex p={2} color={'gray.700'} boxShadow="md" alignItems={'center'}>
      <Flex flex={1} alignItems={'center'} flexWrap={'wrap'} me={4}>
        <Heading
          mt={2}
          mb={2}
          fontSize={{ base: 'md', md: 'xl' }}
          display={'flex'}
          alignItems={'center'}
        >
          <Box display={{ base: 'inline', md: 'none' }} me={1.5}>
            <DrawerMenu {...props.drawerMenuProps} buttonStyleProps={{ size: 'sm' }} />
          </Box>
          <Box># {props.channelName}</Box>
          {!props.isDM && (
            <IconButton
              ml={2}
              aria-label="add user"
              icon={<PersonAdd />}
              size={'xs'}
              onClick={props.onAddUserClick}
            />
          )}
        </Heading>
        {props.description && (
          <Box fontWeight={'light'} color={'gray.700'} fontSize={'xs'} ms={{ base: 2, md: 4 }}>
            {props.description}
          </Box>
        )}
      </Flex>
      <Box textAlign={'right'} fontSize={'xs'}>
        <Tag fontSize={'xs'} colorScheme={'teal'}>
          {props.joinedUserCount} users
        </Tag>
      </Box>
    </Flex>
    {props.inviteUserEditing && (
      <SearchUserModal
        onClose={props.onAddUserCancelClick}
        modalTitle={'invite user'}
        onSearchResultClick={props.onSearchResultClick}
        renderUserName={props.renderUserName}
      />
    )}
    <Messages />
    <CreateMessage channelId={props.channelId} />
  </ChannelsPageUi>
);

const Container: NextPage = () => {
  const [state, setState] = useState({ inviteUserEditing: false });
  const router = useRouter();
  const currentChannelId = router.query.id ? String(router.query.id) : undefined;
  const [{ data, loading }, requestStartTime] = usePageQuery(currentChannelId);
  const [invite] = useInviteChannelMutation();

  if (!currentChannelId || !data) {
    return null;
  }

  const currentChannel = data.channels.find((ch) => ch.id == currentChannelId);
  if (!currentChannel) {
    return <div>page not found..</div>;
  }

  const gotoChannel = (id: string) => router.push(pagesPath.channels._id(id).$url());
  const channelsPageUiProps: UiProps['channelsPageUiProps'] = {
    ...typedFilter(ChannelIdPageDocument, data),
    activeChId: currentChannel.id,
    onChannelCreated: gotoChannel,
    onDMChannelCreated: gotoChannel,
  };

  const uiProps: UiProps = {
    ...state,
    channelId: currentChannel.id,
    channelsPageUiProps,
    drawerMenuProps: channelsPageUiProps,
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

  const messageContext: MessagesContextType = {
    channelId: currentChannel.id,
    queryData: { loading, data: typedFilter(MessagesDocument, data), requestStartTime },
  };

  return (
    <MessagesContext.Provider value={messageContext}>
      <Ui {...uiProps} />
    </MessagesContext.Provider>
  );
};

const usePageQuery = (channelId: string | undefined) => {
  const ref = useRef({ channelId, requestStartTime: new Date().getTime() });
  if (channelId != null && ref.current.channelId !== channelId) {
    ref.current.requestStartTime = new Date().getTime();
    ref.current.channelId = channelId;
  }

  return [
    useQuery(ChannelIdPageDocument, {
      variables: { channelId: channelId || '', last: 20 },
      skip: channelId == null,
    }),
    ref.current.requestStartTime,
  ] as const;
};

gql`
  query ChannelIdPage($channelId: ID!, $last: Int = 10, $before: String) {
    ...Channels_query
    ...Messages_query
  }
`;

export default Container;
