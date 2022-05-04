import {
  Avatar,
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Textarea,
  TextareaProps,
  VStack,
} from '@chakra-ui/react';
import gql from 'graphql-tag';
import React, { forwardRef, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import { MoreVert } from '@/components/Icons';
import {
  useDeleteMessageMutation,
  useUpdateMessageMutation,
  MessageListItem_MessageFragment,
} from '@/hooks/api';
import { withKeyboardShortcut } from '@/libs/keyboard';

type UiProps = {
  message: string;
  date: string;
  userName: string;
  isOwner: boolean;
  isEditing: boolean;
  onMessageChange: TextareaProps['onChange'];
  onMessageKeyDown?: TextareaProps['onKeyDown'];
  onEditClick: () => void;
  onSubmitClick: () => void;
  onCancelClick: () => void;
  onMessageDeleteClick: () => void;
};
// eslint-disable-next-line react/display-name
const Ui = forwardRef<HTMLDivElement, UiProps>((props, ref) => (
  <Box
    color={'gray.700'}
    p={1}
    mb={1.5}
    ref={ref}
    _hover={{ bg: props.isEditing ? undefined : 'hover.50' }}
  >
    <HStack alignItems={'baseline'}>
      <Avatar size={'xs'} name={props.userName} />
      <Flex width={'100%'}>
        {!props.isEditing && (
          <Box flex={1}>
            <Heading as={'span'} fontSize={'sm'}>
              {props.userName}
            </Heading>
            <Box
              as={'span'}
              display={{ base: 'block', md: 'initial' }}
              ms={{ base: 0, md: '2' }}
              fontSize={'xs'}
              color={'gray.500'}
            >
              {props.date}
            </Box>
            <Box fontSize={'sm'}>
              {props.message.split(/(\n)/g).map((t, idx) => (
                <React.Fragment key={idx}>{t === '\n' ? <br /> : t}</React.Fragment>
              ))}
            </Box>
          </Box>
        )}
        {props.isOwner && !props.isEditing && (
          <Menu>
            <MenuButton
              size={'md'}
              as={IconButton}
              aria-label="Options"
              icon={<MoreVert />}
              variant="inline"
            />
            <MenuList minWidth={120}>
              <MenuItem onClick={props.onEditClick}>edit</MenuItem>
              <MenuItem onClick={props.onMessageDeleteClick}>remove</MenuItem>
            </MenuList>
          </Menu>
        )}
        {props.isOwner && props.isEditing && (
          <>
            <Textarea
              value={props.message}
              onKeyDown={props.onMessageKeyDown}
              onChange={props.onMessageChange}
              flex={1}
              autoFocus
            />
            <VStack
              ms={1}
              justifyContent={'space-around'}
              alignItems={'left'}
              flexDirection={'column-reverse'}
            >
              <Button size={'xs'} onClick={props.onSubmitClick} colorScheme={'green'}>
                save
              </Button>
              <Button size={'xs'} onClick={props.onCancelClick}>
                cancel
              </Button>
            </VStack>
          </>
        )}
      </Flex>
    </HStack>
  </Box>
));

type ContainerProps = Pick<UiProps, 'isOwner'> & {
  onReadMessage: (id: string) => void;
} & MessageListItem_MessageFragment;
const Container: React.FC<ContainerProps> = (props) => {
  const [state, setState] = useState({ message: props.text, isEditing: false });
  const [updateMessage] = useUpdateMessageMutation();
  const [deleteMessage] = useDeleteMessageMutation();

  const { ref, inView } = useInView({ rootMargin: '-150px 0px 0px 0px', triggerOnce: true });
  const { id, onReadMessage } = props;

  useEffect(() => {
    if (inView && !props.isOwner && !props.isRead) {
      onReadMessage(id);
    }
  }, [inView, onReadMessage, props.isOwner, props.isRead, id]);

  useEffect(() => {
    setState((current) => ({ ...current, message: props.text }));
  }, [props.text]);

  const onCancelClick = () => {
    setState((current) => ({ ...current, isEditing: false }));
  };

  const onSubmitClick = () => {
    updateMessage({ variables: { id: props.id, text: state.message } }).then((res) => {
      if (res.data && !res.error) {
        setState((current) => ({ ...current, isEditing: false }));
      }
    });
  };

  const uiProps: UiProps = {
    ...state,
    date: props.date,
    userName: props.user.name,
    isOwner: props.isOwner,
    onEditClick: () => {
      setState((current) => ({ ...current, isEditing: true }));
    },
    onCancelClick,
    onMessageChange: ({ target: { value } }) => {
      setState((current) => ({ ...current, message: value }));
    },
    onMessageKeyDown: withKeyboardShortcut({ submit: onSubmitClick, cancel: onCancelClick }),
    onSubmitClick,
    onMessageDeleteClick: () => {
      deleteMessage({ variables: { id: props.id } });
    },
  };

  return <Ui {...uiProps} ref={ref} />;
};

gql`
  fragment MessageListItem_message on Message {
    id
    text
    date
    isRead
    user {
      name
    }
  }
`;

export { Container as MessageListItem };
export type { ContainerProps as MessageListItemProps };
