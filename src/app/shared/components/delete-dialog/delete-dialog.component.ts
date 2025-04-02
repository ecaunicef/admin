import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-delete-dialog',
  templateUrl: './delete-dialog.component.html',
  styleUrls: ['./delete-dialog.component.css']
})
export class DeleteDialogComponent implements OnInit{
  constructor(
    public dialogref: MatDialogRef<DeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public sanitizer: DomSanitizer
  ) { }

  checkBoxisChecked:any = false;

  ngOnInit() {

    this.data.messageDialog = this.sanitizer.bypassSecurityTrustHtml(this.data.messageDialog);
  }
  public confirmSelection() {
    // console.log(this.data);

    if(this.data?.showConfirmCheckbox==true){
      this.dialogref.close({status:true,checkBox:this.checkBoxisChecked});
    }else{  
      this.dialogref.close(true);
    }
    
  }

}
