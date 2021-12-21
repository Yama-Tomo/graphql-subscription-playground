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
import { types } from '@/hooks/api';
import { useSearchUsers } from '@/hooks/user';

type UiProps = {
  modalTitle: string;
  loading: boolean;
  userName: InputProps['value'];
  onUserNameChange: InputProps['onChange'];
  onSearchResultClick: (user: types.SearchUsersQuery['searchUsers'][number]) => void;
  searchResults?: types.SearchUsersQuery['searchUsers'];
} & Pick<ModalProps, 'isOpen' | 'onClose'>;
const Ui: React.FC<UiProps> = (props) => (
  <Modal isOpen={props.isOpen} onClose={props.onClose}>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>{props.modalTitle}</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <FormControl isRequired>
          <FormLabel htmlFor={`user-name-form`}>user name</FormLabel>
          <Input
            id={`user-name-form`}
            type="text"
            value={props.userName}
            onChange={props.onUserNameChange}
            placeholder={'search user name...'}
            autoFocus
          />
          <Box mt={'1rem'} mb={'1rem'}>
            {!props.loading &&
              props.userName !== '' &&
              props.searchResults &&
              props.searchResults.length === 0 && <Box>user not found...</Box>}
            {!props.loading && props.searchResults && props.searchResults.length > 0 && (
              <UnorderedList>
                {props.searchResults.map((user) => (
                  <ListItem key={user.id}>
                    <Link onClick={() => props.onSearchResultClick(user)}>{user.name}</Link>
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
  onCreateCancel: UiProps['onClose'];
  myUserId: string;
} & Pick<UiProps, 'onSearchResultClick' | 'modalTitle'>;
const Container: React.FC<ContainerProps> = (props) => {
  const { data: users, search, loading, input, reset } = useSearchUsers();

  const uiProps: UiProps = {
    modalTitle: props.modalTitle,
    loading,
    userName: input,
    isOpen: true,
    searchResults: users?.searchUsers.filter((user) => user.id != props.myUserId),
    onClose: props.onCreateCancel,
    onUserNameChange: ({ target: { value } }) => search(value),
    onSearchResultClick(user) {
      props.onSearchResultClick(user);
      reset();
    },
  };

  return <Ui {...uiProps} />;
};

export { Container as SearchUserModal };
export type { ContainerProps as SearchUserModalProps };
