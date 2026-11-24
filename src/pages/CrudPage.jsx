import { useParams } from 'react-router-dom';
import CrudModule from '../components/tables/CrudModule';

export default function CrudPage({ configKey }) {
  return <CrudModule configKey={configKey} />;
}

export function CrudPageWithParam() {
  const { moduleKey } = useParams();
  return <CrudModule configKey={moduleKey} />;
}
