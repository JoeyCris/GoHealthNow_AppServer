#!/bin/sh
now="$(date +'%Y_%m_%d_%H_%M_%S')"
filename="db_backup_$now".tar.bz2
backupfolder=`pwd`/"$now"
mkdir -p "$backupfolder"
fullbackuppath="$backupfolder/$filename"
logfile=`pwd`/backup_log_"$(date +'%Y_%m')".txt
echo "***************************************************************"
echo "mongodump started at $(date +'%Y-%m-%d %H:%M:%S')" >>"$logfile"
mongodump --db=rawdata --out "$backupfolder"
tar jcvf "$filename" ./"$now"
rm -rf "$backupfolder"
scp "$filename" nodejs@dev.kdd.csd.uwo.ca:~/production_db_backup/
echo "mongodump finished at $(date +'%Y-%m-%d %H:%M:%S')" >>"$logfile"
echo "***************************************************************"
exit 0
