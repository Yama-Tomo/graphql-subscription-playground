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
import React from 'react';
import { gql } from 'urql';

import { useSearchUsers } from './lib';

type User = { id: string; name: string };
type UiProps = {
  modalTitle: string;
  loading: boolean;
  userName: InputProps['value'];
  onUserNameChange: InputProps['onChange'];
  onSearchResultClick: (user: User) => void;
  searchResults?: User[];
  renderUserName?: (user: User) => JSX.Element;
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
          <Box mt={4} mb={4}>
            {!props.loading &&
              props.userName !== '' &&
              props.searchResults &&
              props.searchResults.length === 0 && <Box>user not found...</Box>}
            {!props.loading && props.searchResults && props.searchResults.length > 0 && (
              <UnorderedList>
                {props.searchResults.map((user) => (
                  <ListItem key={user.id}>
                    <Link onClick={() => props.onSearchResultClick(user)}>
                      {props.renderUserName ? props.renderUserName(user) : user.name}
                    </Link>
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

type ContainerProps = Pick<
  UiProps,
  'onSearchResultClick' | 'modalTitle' | 'onClose' | 'renderUserName'
>;
const Container: React.FC<ContainerProps> = (props) => {
  const { data, search, loading, input, reset } = useSearchUsers();

  const uiProps: UiProps = {
    ...props,
    modalTitle: props.modalTitle,
    loading,
    userName: input,
    isOpen: true,
    searchResults: data?.searchUsers.filter((user) => user.id != data.myProfile.id),
    onClose: props.onClose,
    onUserNameChange: ({ target: { value } }) => search(value),
    onSearchResultClick(user) {
      props.onSearchResultClick(user);
      reset();
    },
  };

  return <Ui {...uiProps} />;
};

gql`
  query SearchUserModal($name: String!) {
    myProfile {
      id
    }
    searchUsers(name: $name) {
      id
      name
    }
  }
`;

export { Container as SearchUserModal };
export type { ContainerProps as SearchUserModalProps };
