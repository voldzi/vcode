import { parseArgs } from 'node:util';
import { publishRelease, promoteAccepted, loadCatalog, publicMetadata, privateBuildProof } from '../services/downloads/release.mjs';

const {values}=parseArgs({options:{root:{type:'string'},catalog:{type:'string'},'trusted-public-key':{type:'string'},
  source:{type:'string'},manifest:{type:'string'},receipt:{type:'string'},'ack-ready':{type:'string'},'ack-privacy':{type:'string'},'ack-scope':{type:'string'},
  rollback:{type:'string'},'export-public':{type:'boolean'},'export-private-build-proof':{type:'boolean'}},strict:true});
const base={root:values.root,catalogPath:values.catalog,trustedKeyPath:values['trusted-public-key'],
  ackReady:values['ack-ready'],ackPrivacy:values['ack-privacy'],ackScope:values['ack-scope']};
try {
  if(values['export-public']&&values['export-private-build-proof'])throw Error('Choose one export');
  const exporting=values['export-public']||values['export-private-build-proof'];
  if(!base.root||!base.catalogPath||!base.trustedKeyPath||(!exporting&&(!base.ackReady||!base.ackPrivacy)))throw Error('Missing publisher inputs');
  const result=values['export-public']?publicMetadata(await loadCatalog(base)):values['export-private-build-proof']?privateBuildProof(await loadCatalog(base)):values.rollback?await promoteAccepted({...base,id:values.rollback})
    :await publishRelease({...base,sourceDirectory:values.source,manifestFile:values.manifest,receiptFile:values.receipt});
  process.stdout.write(JSON.stringify(result)+'\n');
} catch {
  // No arbitrary source paths, attestation bodies or credentials in public logs.
  process.stderr.write('Release publication refused. Review the private handoff and required approvals.\n');
  process.exitCode=1;
}
