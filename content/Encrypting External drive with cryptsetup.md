This is mostly for self reference but if you ever want to encrypt an external drive, here's how you can do that.
```bash
#!/usr/bin/bash

if [ -z "${KEY_PATH}" ]; then

echo "Error: KEY_PATH environment variable is required."

exit 1

fi  

if [ -z "${DISK}" ]; then

echo "Error: DISK environment variable is required."

exit 1

fi 

if [ -z "${ENCRYPTED_DISK}" ]; then

echo "Error: DISK environment variable is required."

echo "should start with dm-DISK_NAME."

exit 1

fi

sudo dd if=/dev/urandom of=${KEY_PATH} bs=1 count=4096


sudo cryptsetup -q -s 512 luksFormat ${DISK} ${KEY_PATH} 

sudo cryptsetup --allow-discards luksOpen -d ${KEY_PATH} ${DISK} ${ENCRYPTED_DISK}
sudo mkfs.ext4 /dev/mapper/${ENCRYPTED_DISK}
sudo tune2fs -e remount-ro /dev/mapper/${ENCRYPTED_DISK}

FSTAB_ENTRY="/dev/mapper/${ENCRYPTED_DISK} $TARGET ext4 defaults 0 0"
echo "Successfully encrypted $DISK => $ENCRYPTED_DISK !"
echo "modify /etc/fstab to your needs."
echo "it should most likely look like:"
echo $FSTAB_ENTRY
echo "do you want me to add it? (y/n)"
read input
input=$(echo "$input" | tr '[:upper:]' '[:lower:]') 
if [ "$input" == "y" ]; then
sudo mkdir -p $TARGET
echo FSTAB_ENTRY | sudo tee -a /etc/fstab
else
echo "Not making changes"
fi
```
save this and run it as  (change the args of course)
```
KEY_PATH=$HOME/.key DISK=/dev/sdb ENCRYPTED_DISK=dm-sdb TARGET=/data bash ./encrypt.sh
```