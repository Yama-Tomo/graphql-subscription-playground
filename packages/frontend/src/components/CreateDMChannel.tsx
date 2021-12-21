import React from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  InputProps,
  Link,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  UnorderedList,
} from '@chakra-ui/react';
import { types, useCreateChannelMutation, useMyChannelAndProfileQuery } from '@/hooks/api';
import { useSearchUsers } from '@/hooks/user';

type UiProps = {
  loading: boolean;
  name: InputProps['value'];
  onNameChange: InputProps['onChange'];
  onCreateClick: (user: types.SearchUsersQuery['searchUsers'][number]) => void;
  users?: types.SearchUsersQuery['searchUsers'];
} & Pick<ModalProps, 'isOpen' | 'onClose'>;
const Ui: React.FC<UiProps> = (props) => (
  <Modal isOpen={props.isOpen} onClose={props.onClose}>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>create DM channel</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <FormControl isRequired>
          <FormLabel htmlFor={`user-name-form`}>user name</FormLabel>
          <Input
            id={`user-name-form`}
            type="text"
            value={props.name}
            onChange={props.onNameChange}
            placeholder={'search user name...'}
            autoFocus
          />
          <Box mt={'1rem'} mb={'1rem'}>
            {!props.loading && props.name !== '' && props.users && props.users.length === 0 && (
              <Box>user not found...</Box>
            )}
            {!props.loading && props.users && props.users.length > 0 && (
              <UnorderedList>
                {props.users.map((user) => (
                  <ListItem key={user.id}>
                    <Link onClick={() => props.onCreateClick(user)}>{user.name}</Link>
                  </ListItem>
                ))}
              </UnorderedList>
            )}
          </Box>
        </FormControl>
      </ModalBody>
    </ModalContent>
  </Modal>
);

type ContainerProps = {
  onCreated?: (channelId: string) => void;
  onCreateCancel: UiProps['onClose'];
  myUserId: string;
};
const Container: React.FC<ContainerProps> = (props) => {
  const { data: users, search, loading, input, reset } = useSearchUsers();
  const { data } = useMyChannelAndProfileQuery();
  const [createChannel] = useCreateChannelMutation();

  const uiProps: UiProps = {
    loading,
    name: input,
    isOpen: true,
    users: users?.searchUsers.filter((user) => user.id != props.myUserId),
    onClose: props.onCreateCancel,
    onNameChange: ({ target: { value } }) => search(value),
    onCreateClick: (user) => {
      if (!data) {
        return;
      }

      const alreadyCreatedChannel = data.channels.find(
        (channel) => channel.isDM && channel.joinUsers.find((u) => u.id == user.id)
      );
      if (alreadyCreatedChannel) {
        props.onCreated?.(alreadyCreatedChannel.id);
        reset();
        return;
      }

      const channelName = [data.myProfile.name, user.name].join(', ');
      const variables = {
        variables: { name: channelName, description: '', isDM: true, joinUsers: [user.id] },
      };
      createChannel(variables).then((res) => {
        if (!res.error && res.data) {
          props.onCreated?.(res.data.createChannel.id);
          reset();
        }
      });
    },
  };

  return <Ui {...uiProps} />;
};

export { Container as CreateDMChannel };
export type { ContainerProps as CreateDMChannelProps };
