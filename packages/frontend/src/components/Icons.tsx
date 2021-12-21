import { Icon, IconProps } from '@chakra-ui/react';
import { MdMoreVert, MdAddCircleOutline } from 'react-icons/md';

type Props = Omit<IconProps, 'as'>;
const MoreVert = (props: Props) => <Icon as={MdMoreVert} {...props} />;
const AddCircleOutline = (props: Props) => <Icon as={MdAddCircleOutline} {...props} />;

export { MoreVert, AddCircleOutline };
