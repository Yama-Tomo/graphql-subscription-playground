import React from 'react';
import { gql } from 'urql';

import { SearchUserModal, SearchUserModalProps } from '@/components/SearchUserModal';
import { CreateDmChannelModalDocument, useCreateChannelMutation, useQuery } from '@/hooks/api';

type ContainerProps = {
  onCreated?: (channelId: string) => void;
  onCreateCancel: SearchUserModalProps['onClose'];
};
const Container: React.FC<ContainerProps> = (props) => {
  const { data } = useQuery(CreateDmChannelModalDocument);
  const [createChannel] = useCreateChannelMutation();

  const uiProps: SearchUserModalProps = {
    ...props,
    onClose: props.onCreateCancel,
    modalTitle: 'create DM channel',
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

gql`
  query CreateDMChannelModal {
    channels {
      id
      isDM
      joinUsers {
        id
      }
    }
    myProfile {
      name
    }
  }
`;

export { Container as CreateDMChannelModal };
export type { ContainerProps as CreateDMChannelModalProps };
