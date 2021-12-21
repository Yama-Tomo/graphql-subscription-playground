import React from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputProps,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
} from '@chakra-ui/react';

type UiProps = {
  name: InputProps['value'];
  onNameChange: InputProps['onChange'];
  description: InputProps['value'];
  onDescriptionChange: InputProps['onChange'];
  onCreateClick: () => void;
  mode: 'update' | 'create';
} & Pick<ModalProps, 'isOpen' | 'onClose'>;
const Ui: React.FC<UiProps> = (props) => (
  <Modal isOpen={props.isOpen} onClose={props.onClose}>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>{props.mode} channel</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <FormControl isRequired>
          <FormLabel htmlFor={`channel-name-form`}>name</FormLabel>
          <Input
            id={`channel-name-form`}
            type="text"
            value={props.name}
            onChange={props.onNameChange}
            placeholder={'example-channel'}
            autoFocus
          />
        </FormControl>
        <FormControl marginBlockStart={4}>
          <FormLabel htmlFor={`channel-description-form`}>description</FormLabel>
          <Input
            id={`channel-description-form`}
            type="text"
            value={props.description}
            onChange={props.onDescriptionChange}
          />
        </FormControl>
      </ModalBody>
      <ModalFooter>
        <Button colorScheme="blue" size={'sm'} onClick={props.onCreateClick}>
          submit
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);

export { Ui as ChannelFormModal };
export type { UiProps as ChannelFormModalProps };
