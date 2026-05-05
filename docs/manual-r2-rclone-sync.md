# Manual R2 to Local PC Sync

R2 is the official secure storage. The local PC is a working copy only.

Only accepted and reviewed orders should be manually synced to the local PC after admin review.

Suggested local structure:

```text
Academic-AI-Lab-Orders/
  AAL-2026-0001_ClientName_Service/
    01_Client_Uploads/
    02_Admin_Review/
    03_Working_Files/
    04_Expert_Output/
    05_Final_Delivery/
    06_Payment_Proof/
    07_Notes/
```

Future R2 folders:

```text
client-uploads/{order_id}/
deliveries/{order_id}/
payment-proof/{order_id}/
```

Example rclone workflow after configuring an R2 remote outside this repo:

```bash
rclone lsd aal-r2:client-uploads
rclone sync aal-r2:client-uploads/AAL-2026-0001 Academic-AI-Lab-Orders/AAL-2026-0001_ClientName_Service/01_Client_Uploads --dry-run
rclone sync aal-r2:client-uploads/AAL-2026-0001 Academic-AI-Lab-Orders/AAL-2026-0001_ClientName_Service/01_Client_Uploads
```

Do not make the R2 bucket public. Use signed or temporary links for future client upload and delivery flows.
