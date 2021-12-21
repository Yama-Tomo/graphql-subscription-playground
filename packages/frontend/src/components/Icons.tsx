import { Icon, IconProps } from '@chakra-ui/react';
import { MdMoreVert, MdAddCircleOutline, MdPersonAdd } from 'react-icons/md';

type Props = Omit<IconProps, 'as'>;
const MoreVert = (props: Props) => <Icon as={MdMoreVert} {...props} />;
const AddCircleOutline = (props: Props) => <Icon as={MdAddCircleOutline} {...props} />;
const PersonAdd = (props: Props) => <Icon as={MdPersonAdd} {...props} />;

export { MoreVert, AddCircleOutline, PersonAdd };
