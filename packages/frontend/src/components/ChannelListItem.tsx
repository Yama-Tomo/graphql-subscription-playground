import {
  Box,
  Link as ChakraUILink,
  IconButton,
  ListItem,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from '@chakra-ui/react';
import styled from '@emotion/styled';
import React, { useEffect, useState } from 'react';
import { gql } from 'urql';

import { ChannelFormModal, ChannelFormModalProps } from '@/components/ChannelFormModal';
import { MoreVert } from '@/components/Icons';
import { Link } from '@/components/Link';
import {
  useDeleteChannelMutation,
  useUpdateChannelNameMutation,
  ChannelListItem_ChannelWithPersonalizedDataFragment,
} from '@/hooks/api';
import { useDelayedUnReadCountRender } from '@/hooks/message';
import { pagesPath } from '@/libs/$path';

type UiProps = {
  name: string;
  active?: boolean;
  id: string;
  isOwner: boolean;
  isEditing: boolean;
  onEditClick: () => void;
  onDeleteChannelClick: () => void;
  isDM: boolean;
  unReadCount?: number;
  className?: string;
  updateChannelModalProps: ChannelFormModalProps;
};
const Ui: React.FC<UiProps> = (props) => (
  <ListItem
    className={props.className}
    display="flex"
    bg={props.active ? 'teal.100' : ''}
    alignItems={'center'}
  >
    <>
      <Link href={pagesPath.channels._id(props.id).$url()}>
        <ChakraUILink
          flex={1}
          textOverflow={'ellipsis'}
          whiteSpace={'nowrap'}
          overflow={'hidden'}
          minWidth={0}
          alignItems={'center'}
        >
          {!props.isDM && '# '}
          {props.name}
        </ChakraUILink>
      </Link>
      {props.unReadCount != null && props.unReadCount > 0 && (
        <Box
          backgroundColor={'#d62b5c'}
          color={'white'}
          display={'flex'}
          borderRadius={'10px'}
          alignItems={'center'}
          justifyContent={'center'}
          width={6}
          height={4}
          textAlign={'center'}
          fontSize={'xs'}
          ml={1}
        >
          {props.unReadCount}
        </Box>
      )}
      {!props.isDM && props.isOwner && !props.isEditing ? (
        <Menu>
          <MenuButton
            size={'xs'}
            as={IconButton}
            aria-label={`${props.name}-options`}
            icon={<MoreVert />}
            variant="inline"
          />
          <MenuList minWidth={120}>
            <MenuItem onClick={props.onEditClick}>edit</MenuItem>
            <MenuItem onClick={props.onDeleteChannelClick}>remove</MenuItem>
          </MenuList>
        </Menu>
      ) : (
        <Box width={6} />
      )}
    </>
    {props.isOwner && <ChannelFormModal {...props.updateChannelModalProps} />}
  </ListItem>
);

// styled-components like なスタイリング(あまり推奨されていない..?
const StyledUi = styled(Ui)`
  &:hover {
    background-color: ${(p) => p.theme.colors.hover['50']}};
  }
`;

type ContainerProps = ChannelListItem_ChannelWithPersonalizedDataFragment &
  Pick<UiProps, 'active' | 'isOwner'>;
const Container: React.FC<ContainerProps> = (props) => {
  const [state, setState] = useState<{ name: string; description: string; isEditing: boolean }>({
    name: props.name,
    description: props.description || '',
    isEditing: false,
  });
  const [updateChannel] = useUpdateChannelNameMutation();
  const [deleteChannel] = useDeleteChannelMutation();

  useEffect(() => {
    setState((current) => ({
      ...current,
      name: props.name,
      description: props.description ?? '',
    }));
  }, [props.name, props.description]);

  const unReadCount = useDelayedUnReadCountRender(!!props?.active, props.unReadMessageCount);

  const uiProps: UiProps = {
    ...props,
    unReadCount,
    onEditClick: () => {
      setState((current) => ({ ...current, isEditing: true }));
    },
    isEditing: state.isEditing,
    updateChannelModalProps: {
      ...state,
      isOpen: state.isEditing,
      mode: 'update',
      onClose: () => {
        // キャンセルしたら入力状態はリセット
        setState((current) => ({
          ...current,
          isEditing: false,
          name: props.name,
          description: props.description ?? '',
        }));
      },
      onNameChange: ({ target: { value } }) => {
        setState((current) => ({ ...current, name: value }));
      },
      onDescriptionChange: ({ target: { value } }) => {
        setState((current) => ({ ...current, description: value }));
      },
      onCreateClick: () => {
        updateChannel({
          variables: { id: props.id, name: state.name, description: state.description },
        }).then((res) => {
          if (res.data && !res.error) {
            setState((current) => ({ ...current, isEditing: false }));
          }
        });
      },
    },
    onDeleteChannelClick: () => {
      deleteChannel({ variables: { id: props.id } });
    },
  };

  return <StyledUi {...uiProps} />;
};

gql`
  fragment ChannelListItem_channelWithPersonalizedData on ChannelWithPersonalizedData {
    id
    isDM
    unReadMessageCount
    name
    description
  }
`;

export { Container as ChannelListItem };
export type { ContainerProps as ChannelListItemProps };
