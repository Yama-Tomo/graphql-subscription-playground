import React, { useState } from 'react';
import { Box, Textarea, Flex, IconButton, TextareaProps } from '@chakra-ui/react';
import { useCreateMessageMutation } from '@/hooks/api';
import { Send } from '@/components/Icons';

type UiProps = {
  message: TextareaProps['value'];
  onMessageChange: TextareaProps['onChange'];
  onSendClick: () => void;
};
const Ui: React.FC<UiProps> = (props) => (
  <Box p={3}>
    <Flex alignItems={'flex-end'}>
      <Textarea value={props.message} onChange={props.onMessageChange} flex={1} />
      <IconButton
        ms={1}
        colorScheme={'blue'}
        aria-label="send message"
        icon={<Send />}
        size={'sm'}
        onClick={props.onSendClick}
      />
    </Flex>
  </Box>
);

type ContainerProps = {
  channelId: string;
};
const Container: React.FC<ContainerProps> = (props) => {
  const [state, setState] = useState({ message: '' });
  const [createMessage] = useCreateMessageMutation();

  const uiProps: UiProps = {
    ...state,
    onMessageChange: ({ target: { value } }) => {
      setState((current) => ({ ...current, message: value }));
    },
    onSendClick: () => {
      createMessage({ variables: { text: state.message, channelId: props.channelId } }).then(
        (res) => {
          if (!res.error && res.data?.createMessage) {
            setState({ message: '' });
          }
        }
      );
    },
  };

  return <Ui {...uiProps} />;
};

export { Container as CreateMessage };
export type { ContainerProps as CreateMessageProps };
