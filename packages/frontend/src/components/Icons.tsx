import { Icon, IconProps } from '@chakra-ui/react';
import { MdMoreVert, MdAddCircleOutline, MdPersonAdd, MdSend } from 'react-icons/md';

type Props = Omit<IconProps, 'as'>;
const MoreVert = (props: Props) => <Icon as={MdMoreVert} {...props} />;
const AddCircleOutline = (props: Props) => <Icon as={MdAddCircleOutline} {...props} />;
const PersonAdd = (props: Props) => <Icon as={MdPersonAdd} {...props} />;
const Send = (props: Props) => <Icon as={MdSend} {...props} />;

export { MoreVert, AddCircleOutline, PersonAdd, Send };
