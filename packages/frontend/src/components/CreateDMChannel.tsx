import React from 'react';
import { useCreateChannelMutation, useMyChannelAndProfileQuery } from '@/hooks/api';
import { SearchUserModal, SearchUserModalProps } from '@/components/SearchUserModal';

type ContainerProps = {
  onCreated?: (channelId: string) => void;
} & Pick<SearchUserModalProps, 'onCreateCancel'>;
const Container: React.FC<ContainerProps> = (props) => {
  const { data } = useMyChannelAndProfileQuery();
  const [createChannel] = useCreateChannelMutation();

  const uiProps: SearchUserModalProps = {
    ...props,
    modalTitle: 'create DM channel',
    myUserId: data?.myProfile.id || '',
    onSearchResultClick: (user) => {
      if (!data) {
        return;
      }

      const alreadyCreatedChannel = data.channels.find(
        (channel) => channel.isDM && channel.joinUsers.find((u) => u.id == user.id)
      );
      if (alreadyCreatedChannel) {
        props.onCreated?.(alreadyCreatedChannel.id);
        return;
      }

      const channelName = [data.myProfile.name, user.name].join(', ');
      const variables = {
        variables: { name: channelName, description: '', isDM: true, joinUsers: [user.id] },
      };
      createChannel(variables).then((res) => {
        if (!res.error && res.data) {
          props.onCreated?.(res.data.createChannel.id);
        }
      });
    },
  };

  return <SearchUserModal {...uiProps} />;
};

export { Container as CreateDMChannel };
export type { ContainerProps as CreateDMChannelProps };
