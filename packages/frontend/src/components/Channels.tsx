import React, { useState } from 'react';
import { Box, BoxProps, Heading, IconButton, List, ListItem } from '@chakra-ui/react';
import { CreateChannel, CreateChannelProps } from '@/components/CreateChannel';
import { ChannelListItem } from '@/components/ChannelListItem';
import { AddCircleOutline } from '@/components/Icons';
import { ListSkeleton } from '@/components/ListSkelton';
import { CreateDMChannel, CreateDMChannelProps } from '@/components/CreateDMChannel';
import { getDMChannelName } from '@/libs/channel';
import { types } from '@/hooks/api';

type ChannelTypes = 'channel' | 'DM' | undefined;
type UiProps = {
  channels: types.MyChannelAndProfileQuery['channels'];
  DMChannels: types.MyChannelAndProfileQuery['channels'];
  loading: boolean;
  editingChannelType: ChannelTypes;
  onCreateClick: (channelType: ChannelTypes) => void;
  onChannelCreated: CreateChannelProps['onCreated'];
  onChannelCreateCancel: CreateChannelProps['onCreateCancel'];
  onDMChannelCreated: CreateDMChannelProps['onCreated'];
  onDMChannelCreateCancel: CreateDMChannelProps['onCreateCancel'];
  myUserId: string;
  sideNavStyle?: BoxProps;
  activeChId?: string;
};
const Ui: React.FC<UiProps> = ({
  channels,
  DMChannels,
  myUserId,
  activeChId,
  loading,
  onCreateClick,
  onChannelCreateCancel,
  onChannelCreated,
  onDMChannelCreateCancel,
  onDMChannelCreated,
  editingChannelType,
  sideNavStyle = {},
  children,
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
        {!loading &&
          channels.map((ch) => (
            <ChannelListItem
              {...ch}
              key={ch.id}
              isOwner={ch.ownerId === myUserId}
              unReadCount={ch.unReadMessageCount}
              active={activeChId === ch.id}
            />
          ))}
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
        {!loading &&
          DMChannels.map((ch) => (
            <ChannelListItem
              {...ch}
              key={ch.id}
              isOwner={ch.ownerId === myUserId}
              unReadCount={ch.unReadMessageCount}
              active={activeChId === ch.id}
            />
          ))}
      </List>
    </Box>
    <Box flex="1">{children}</Box>
    {editingChannelType === 'channel' && (
      <CreateChannel onCreateCancel={onChannelCreateCancel} onCreated={onChannelCreated} />
    )}
    {editingChannelType === 'DM' && (
      <CreateDMChannel
        onCreateCancel={onDMChannelCreateCancel}
        onCreated={onDMChannelCreated}
      />
    )}
  </>
);

type ContainerProps = Pick<
  UiProps,
  | 'activeChId'
  | 'channels'
  | 'DMChannels'
  | 'myUserId'
  | 'loading'
  | 'sideNavStyle'
  | 'onDMChannelCreated'
  | 'onChannelCreated'
>;
const Container: React.FC<ContainerProps> = (props) => {
  const [state, setState] = useState<{ editingChannelType: ChannelTypes | undefined }>({
    editingChannelType: undefined,
  });

  const hideModal = () => setState((current) => ({ ...current, editingChannelType: undefined }));

  const uiProps: UiProps = {
    ...props,
    ...state,
    channels: props.channels.filter((channel) => !channel.isDM),
    DMChannels: props.DMChannels.filter((channel) => channel.isDM).map((channel) => ({
      ...channel,
      name: getDMChannelName(channel, props.myUserId),
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

export { Container as Channels };
export type { ContainerProps as ChannelsProps };
