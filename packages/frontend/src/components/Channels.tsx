import { Box, BoxProps, Heading, IconButton, List, ListItem } from '@chakra-ui/react';
import React, { useState } from 'react';
import { gql } from 'urql';

import { ChannelListItem, ChannelListItemProps } from '@/components/ChannelListItem';
import { CreateChannelModal, CreateChannelModalProps } from '@/components/CreateChannelModal';
import { CreateDMChannelModal, CreateDMChannelModalProps } from '@/components/CreateDMChannelModal';
import { AddCircleOutline } from '@/components/Icons';
import { ListSkeleton } from '@/components/ListSkelton';
import {
  Channels_QueryFragment,
  ChannelListItem_ChannelWithPersonalizedDataFragmentDoc,
  typedFilter,
} from '@/hooks/api';

type ChannelTypes = 'channel' | 'DM' | undefined;
type UiProps = {
  channels: ChannelListItemProps[];
  DMChannels: ChannelListItemProps[];
  loading: boolean;
  editingChannelType: ChannelTypes;
  onCreateClick: (channelType: ChannelTypes) => void;
  // TODO: context Api にして props drilling 回避
  onChannelCreated: CreateChannelModalProps['onCreated'];
  onChannelCreateCancel: CreateChannelModalProps['onCreateCancel'];
  onDMChannelCreated: CreateDMChannelModalProps['onCreated'];
  onDMChannelCreateCancel: CreateDMChannelModalProps['onCreateCancel'];
  sideNavStyle?: BoxProps;
};
const Ui: React.FC<UiProps> = ({
  channels,
  DMChannels,
  loading,
  onCreateClick,
  onChannelCreateCancel,
  onChannelCreated,
  onDMChannelCreateCancel,
  onDMChannelCreated,
  editingChannelType,
  sideNavStyle = {},
}) => (
  <>
    <Box as={'nav'} {...sideNavStyle}>
      <List color="gray.700" spacing={2} fontSize={14}>
        <ListItem>
          <Heading mt={4} size={'sm'} display={'flex'} alignItems={'center'}>
            <Box flex={1}>channels</Box>
            <IconButton
              aria-label="invite user"
              icon={<AddCircleOutline />}
              size={'xs'}
              onClick={() => onCreateClick('channel')}
            />
          </Heading>
        </ListItem>
        {loading && <ListSkeleton length={3} height={'16px'} />}
        {!loading && channels.map((ch) => <ChannelListItem key={ch.id} {...ch} />)}
        <ListItem>
          <Heading mt={4} size={'sm'} display={'flex'} alignItems={'center'}>
            <Box flex={1}>DM</Box>
            <IconButton
              aria-label="add direct message"
              icon={<AddCircleOutline />}
              size={'xs'}
              onClick={() => onCreateClick('DM')}
            />
          </Heading>
        </ListItem>
        {loading && <ListSkeleton length={3} height={'16px'} />}
        {!loading && DMChannels.map((ch) => <ChannelListItem key={ch.id} {...ch} />)}
      </List>
    </Box>
    {editingChannelType === 'channel' && (
      <CreateChannelModal onCreateCancel={onChannelCreateCancel} onCreated={onChannelCreated} />
    )}
    {editingChannelType === 'DM' && (
      <CreateDMChannelModal
        onCreateCancel={onDMChannelCreateCancel}
        onCreated={onDMChannelCreated}
      />
    )}
  </>
);

type ContainerProps = Channels_QueryFragment &
  Pick<UiProps, 'sideNavStyle' | 'onDMChannelCreated' | 'onChannelCreated'> & {
    activeChId?: string;
  };
const Container: React.FC<ContainerProps> = (props) => {
  const [state, setState] = useState<{ editingChannelType: ChannelTypes | undefined }>({
    editingChannelType: undefined,
  });

  const hideModal = () => setState((current) => ({ ...current, editingChannelType: undefined }));
  const myUserId = props.myProfile.id;

  const uiProps: UiProps = {
    ...props,
    ...state,
    loading: false,
    channels: props.channels
      .filter((channel) => !channel.isDM)
      .map((channel) => ({
        ...typedFilter(ChannelListItem_ChannelWithPersonalizedDataFragmentDoc, channel),
        isOwner: channel.ownerId === myUserId,
        active: props.activeChId === channel.id,
      })),
    DMChannels: props.channels
      .filter((channel) => channel.isDM)
      .map((channel) => ({
        ...typedFilter(ChannelListItem_ChannelWithPersonalizedDataFragmentDoc, channel),
        name: channel.joinUsers.find((u) => u.id !== myUserId)?.name || channel.name,
        isOwner: channel.ownerId === myUserId,
        active: props.activeChId === channel.id,
      })),
    onCreateClick: (type) => {
      setState((current) => ({ ...current, editingChannelType: type }));
    },
    onChannelCreateCancel: () => {
      hideModal();
    },
    onChannelCreated: (id) => {
      hideModal();
      props.onChannelCreated?.(id);
    },
    onDMChannelCreated: (id) => {
      hideModal();
      props.onDMChannelCreated?.(id);
    },
    onDMChannelCreateCancel: () => {
      hideModal();
    },
  };

  return <Ui {...uiProps} />;
};

gql`
  fragment Channels_query on Query {
    channels {
      id
      ownerId
      joinUsers {
        id
        name
      }
      ...ChannelListItem_channelWithPersonalizedData
    }
    myProfile {
      id
    }
  }
`;

export { Container as Channels };
export type { ContainerProps as ChannelsProps };
