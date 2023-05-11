npm run build
DEPLOYDIR=../rhumb-site-build
$(cd $DEPLOYDIR; rm --recursive *)
cp --recursive build/* $DEPLOYDIR
cd $DEPLOYDIR
git add --all

