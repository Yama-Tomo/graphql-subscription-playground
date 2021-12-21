import React, { useState } from 'react';
import { useCreateChannelMutation } from '@/hooks/api';
import { ChannelFormModal, ChannelFormModalProps } from '@/components/ChannelFormModal';

type ContainerProps = {
  onCreated?: (channelId: string) => void;
  onCreateCancel: ChannelFormModalProps['onClose'];
};
const Container: React.FC<ContainerProps> = (props) => {
  const [state, setState] = useState({ name: '', description: '' });
  const [createChannel] = useCreateChannelMutation();

  const uiProps: ChannelFormModalProps = {
    ...state,
    isOpen: true,
    onClose: props.onCreateCancel,
    onNameChange: ({ target: { value } }) => setState((current) => ({ ...current, name: value })),
    onDescriptionChange: ({ target: { value } }) =>
      setState((current) => ({ ...current, description: value })),
    onCreateClick: () => {
      createChannel({
        variables: { name: state.name, description: state.description, isDM: false },
      }).then((res) => {
        if (!res.error && res.data?.createChannel) {
          setState({ name: '', description: '' });
          props.onCreated?.(res.data.createChannel.id);
        }
      });
    },
    mode: 'create',
  };

  return <ChannelFormModal {...uiProps} />;
};

export { Container as CreateChannel };
export type { ContainerProps as CreateChannelProps };
