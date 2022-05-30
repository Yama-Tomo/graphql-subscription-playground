import { Box, Flex, Heading, IconButton, Tag } from '@chakra-ui/react';
import { NextPage } from 'next';
import React, { useRef, useState } from 'react';
import { gql } from 'urql';

import { CreateMessage } from '@/components/CreateMessage';
import { DrawerMenu, DrawerMenuProps } from '@/components/DrawerMenu';
import { PersonAdd } from '@/components/Icons';
import { Messages } from '@/components/Messages';
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
} & MessagesProviderProps &
  Pick<SearchUserModalProps, 'renderUserName' | 'onSearchResultClick'>;
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
    <MessagesProvider channelId={props.channelId} />
    <CreateMessage channelId={props.channelId} />
  </ChannelsPageUi>
);

const Container: NextPage = () => {
  const [state, setState] = useState({ inviteUserEditing: false });
  const router = useRouter();
  const currentChannelId = router.query.id ? String(router.query.id) : undefined;
  const [{ data }] = usePageQuery(currentChannelId);
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

  return <Ui {...uiProps} />;
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

type MessagesProviderProps = { channelId: string };
// usePageQuery は上流のコンポーネントでも実行しているのでこの hooks がきっかけの再レンダリングが発生すると再レンダリングが倍になるので
// (更に下層のコンポーネントでも呼び出している場合は更に倍になる）適宜 memo でくるんで再描画の回数を倍にならないようにする
// eslint-disable-next-line react/display-name
const MessagesProvider = React.memo((props: MessagesProviderProps) => {
  const [pageQuery, requestStartTime] = usePageQuery(props.channelId);
  const queryData = {
    loading: pageQuery.loading,
    data: typedFilter(MessagesDocument, pageQuery.data),
    requestStartTime,
  };

  return <Messages {...props} queryData={queryData} />;
});

gql`
  query ChannelIdPage($channelId: ID!, $last: Int = 10, $before: String) {
    ...Channels_query
    ...Messages_query
  }
`;

export default Container;
