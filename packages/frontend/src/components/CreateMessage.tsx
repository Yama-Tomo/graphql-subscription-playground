import React, { useState } from 'react';
import { useCreateMessageMutation } from '@/hooks/api';

type UiProps = {
  message: JSX.IntrinsicElements['textarea']['value'];
  onMessageChange: JSX.IntrinsicElements['textarea']['onChange'];
  onSendClick: () => void;
};
const Ui: React.FC<UiProps> = (props) => (
  <div>
    <textarea value={props.message} onChange={props.onMessageChange} />
    <button onClick={props.onSendClick}>send</button>
  </div>
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
