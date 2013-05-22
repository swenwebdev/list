#!/bin/bash
name="json"
rm $name.nw
rm $name.zip
zip -r0 $name *
cp $name.zip $name.nw
nw $name.nw