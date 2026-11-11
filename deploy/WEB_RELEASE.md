# Web release preparation

`web.Dockerfile` builds the production client with Node 26 and composes its static
files with the currently deployed image, supplied as `PREVIOUS_WEB_IMAGE` with a
full `@sha256:` digest. The API identity comes from the authorized CI parameters.
The existing TeamCity host Dockerfile remains separate; this image recipe is not
active until the release pipeline explicitly selects it.

`retainAssets.js` retains replaced, hashed assets for seven days from their first
replacement. Repeated builds preserve that deadline. HTML and mutable files come
from the new build. A digest collision, inconsistent previous manifest, or a
combined image exceeding 2 GiB / 30000 files fails composition before publication.
An unversioned WASM/binary URL must keep identical bytes across the transition;
changing it fails composition and requires versioning that dependency's URL.
The image keeps the retention manifest private through the Nginx configuration.
Tabs older than the retention window require a reload.

The production Service must switch to a fully ready candidate pool whose image
contains both releases' assets. Ordinary mixed-version rolling updates can route
a new HTML request to a new pod and its next chunk request to an old pod. Retaining
old files in new pods alone does not solve that direction of the race.

Before switching production traffic, qualify the candidate image through an
isolated Service: index/version, all referenced imports and workers, previous
lazy chunks, authentication/session restoration, cache migration, media and calls.
Keep the prior image digest and its ready pool available for rollback. Validate
Service endpoints and both old-tab/new-tab requests after switching. Switching
back must also account for tabs that have already loaded the new build; a plain
rollback image has no new-build chunks. Do not publish this client through the
current mixed-pod pipeline before that transition is implemented and qualified.
