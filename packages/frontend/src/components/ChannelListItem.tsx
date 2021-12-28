import {
  Box,
  Link as ChakraUILink,
  IconButton,
  InputProps,
  ListItem,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from '@chakra-ui/react';
import styled from '@emotion/styled';
import React, { useEffect, useState } from 'react';

import { ChannelFormModal } from '@/components/ChannelFormModal';
import { MoreVert } from '@/components/Icons';
import { Link } from '@/components/Link';
import { useDeleteChannelMutation, useUpdateChannelNameMutation } from '@/hooks/api';
import { useDelayedUnReadCountRender } from '@/hooks/message';
import { pagesPath } from '@/libs/$path';

type UiProps = {
  name: string;
  editName: string;
  editDescription: string;
  active?: boolean;
  id: string;
  isOwner: boolean;
  isEditing: boolean;
  onNameChange: InputProps['onChange'];
  onDescriptionChange: InputProps['onChange'];
  onEditClick: () => void;
  onSubmitClick: () => void;
  onCancelClick: () => void;
  onDeleteChannelClick: () => void;
  isDM: boolean;
  unReadCount?: number;
  className?: string;
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
    {props.isOwner && (
      <ChannelFormModal
        name={props.editName}
        onNameChange={props.onNameChange}
        description={props.editDescription}
        onDescriptionChange={props.onDescriptionChange}
        onCreateClick={props.onSubmitClick}
        mode={'update'}
        isOpen={props.isEditing}
        onClose={props.onCancelClick}
      />
    )}
  </ListItem>
);

// styled-components like なスタイリング(あまり推奨されていない..?
const StyledUi = styled(Ui)`
  &:hover {
    background-color: ${(p) => p.theme.colors.hover['50']}};
  }
`;

type ContainerProps = Pick<
  UiProps,
  'name' | 'id' | 'isOwner' | 'isDM' | 'unReadCount' | 'active'
> & { description?: string | null };
const Container: React.FC<ContainerProps> = (props) => {
  const [state, setState] = useState<{
    editName: string;
    editDescription: string;
    isEditing: boolean;
  }>({
    editName: props.name,
    editDescription: '',
    isEditing: false,
  });
  const [updateChannel] = useUpdateChannelNameMutation();
  const [deleteChannel] = useDeleteChannelMutation();

  useEffect(() => {
    setState((current) => ({
      ...current,
      editName: props.name,
      editDescription: props.description ?? '',
    }));
  }, [props.name, props.description]);

  const unReadCount = useDelayedUnReadCountRender(!!props?.active, props.unReadCount);

  const uiProps: UiProps = {
    ...props,
    ...state,
    unReadCount,
    onEditClick: () => {
      setState((current) => ({ ...current, isEditing: true }));
    },
    onCancelClick: () => {
      // キャンセルしたら入力状態はリセット
      setState((current) => ({
        ...current,
        isEditing: false,
        editName: props.name,
        editDescription: props.description ?? '',
      }));
    },
    onNameChange: ({ target: { value } }) => {
      setState((current) => ({ ...current, editName: value }));
    },
    onDescriptionChange: ({ target: { value } }) => {
      setState((current) => ({ ...current, editDescription: value }));
    },
    onSubmitClick: () => {
      updateChannel({
        variables: { id: props.id, name: state.editName, description: state.editDescription },
      }).then((res) => {
        if (res.data && !res.error) {
          setState((current) => ({ ...current, isEditing: false }));
        }
      });
    },
    onDeleteChannelClick: () => {
      deleteChannel({ variables: { id: props.id } });
    },
  };

  return <StyledUi {...uiProps} />;
};

export { Container as ChannelListItem };
export type { ContainerProps as ChannelListItemProps };
