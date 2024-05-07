import { Component, Inject, OnInit } from '@angular/core';
import { LoginDetails, Survey } from '@core/models';
import { AuthService, CommonFunctionService, LanguageService, NotificationService } from '@core/services';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { VoteAnswer, VoteSetting } from '@core/models/survey.model';
declare var $: any;

@Component({
  selector: 'app-survey-detail-modal',
  templateUrl: './survey-detail-modal.component.html',
  styleUrls: ['./survey-detail-modal.component.css'],
})
export class SurveyDetailModalComponent implements OnInit {
  language: any;
  userDetails: LoginDetails;
  surveyVoteResult: { TotalCount: number; answerCount: { AnswerId: number; count: number }; result: Survey; userCount: number }[];
  surveyData: any;
  imageShow: any;
  surveyVoteForm: UntypedFormGroup;
  vote_answer: VoteAnswer[];
  surveyAnswerId: number[] = [];
  btnDisable: string;
  surveyTypeId: number[] = [];
  show_name: string;
  userRole: string;
  showVoteResult: boolean = false;
  additionalCastVote: boolean = true;
  thumbnail: string;
  vote_setting: VoteSetting[];
  surveyAnswerName: string;
  voteCount: number;
  surveys: any[];
  selectedIndex: number;
  voteAnswer: any;

  constructor(
    private lang: LanguageService,
    private authService: AuthService,
    private commonFunctionService: CommonFunctionService,
    public dialogRef: MatDialogRef<SurveyDetailModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public formBuilder: UntypedFormBuilder,
    private notificationService: NotificationService
  ) {
    this.surveys = data.surveys;
    this.selectedIndex = data.selectedIndex;
  }

  ngOnInit(): void {
    this.language = this.lang.getLanguageFile();
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
    this.userRole = this.userDetails.roles[0];
    this.getVoteResult(this.data['survey'].id);

    this.surveyVoteForm = this.formBuilder.group({
      user_id: [''],
      team_id: [''],
      surveyType: [''],
      surveyTypeId: [''],
      surveyOption: [''],
    });
    if (this.data.type == 'mySurvey' || this.data.type == 'Completed') {
      this.showVoteResult = true;
    }
  }

  /**
   * Function to get survey and vote details by survey Id
   * @author  MangoIt Solutions (T)
   * @param   {}
   * @return  {Array Of Object}
   */
  getVoteResult(id: any) {
    // const surveyId = this.data['survey'].id;
    this.authService.memberSendRequest('get', 'getResultSurveyById/survey/' + id, null).subscribe((respData: any) => {
      this.surveyVoteResult = respData['result'];

      if (this.surveyVoteResult?.['result']?.length > 0) {
        this.surveyData = this.surveyVoteResult['result'][0];

        this.show_name = this.surveyData['additional_anonymous_voting'];
        var date: Date = new Date(); // Today's date
        var date1: string = (date.getMonth() > 8 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1)) + '/' + (date.getDate() > 9 ? date.getDate() : '0' + date.getDate()) + '/' + date.getFullYear();
        var dt2: Date = new Date(this.surveyData.surveyStartDate.split('T')[0]);
        var date2: string = (dt2.getMonth() > 8 ? dt2.getMonth() + 1 : '0' + (dt2.getMonth() + 1)) + '/' + (dt2.getDate() > 9 ? dt2.getDate() : '0' + dt2.getDate()) + '/' + dt2.getFullYear();
        if (date2 <= date1) {
          this.btnDisable = 'false';
        } else {
          this.btnDisable = 'true';
        }

        if (this.surveyData.image && this.surveyData.image != '') {
          let tokenUrl = this.commonFunctionService.genrateImageToken(this.surveyData.id, 'survey');
          this.imageShow = { url: tokenUrl, isLoading: true, imageLoaded: false };
          this.commonFunctionService.loadImage(this.imageShow);
        } else {
          this.imageShow = '';
        }
      }

      if (this.surveyVoteResult && this.surveyVoteResult['answerCount'] && this.surveyVoteResult['answerCount'].length > 0) {
        this.surveyVoteResult['answerCount'].forEach((element, index) => {
          if (this.surveyVoteResult['TotalCount'] != 0) {
            element.per = (element.count / this.surveyVoteResult['TotalCount']) * 100;
          } else {
            element.per = 0;
          }
          this.surveyData.surveyAnswer[index].count = element.count;
          this.surveyData.surveyAnswer[index].per = element.per;
        });
      }
      if (this.surveyData.additional_cast_vote == 'true') {
        this.additionalCastVote = false;
      } else if (this.surveyData.additional_cast_vote == 'false' || (this.surveyData.additional_cast_vote == null && this.surveyData.surveyResult && this.surveyData.surveyResult.length > 0)) {
        this.additionalCastVote = this.surveyData.surveyResult.some(obj => obj['user_id'] === this.userDetails.userId);
      }

      this.surveyData.surveyAnswer = this.surveyData.surveyAnswer.sort((a, b) => b.count - a.count);
      this.getVoteAnswer();
    });
  }

  /**
   * Function to get survey vote answer by user Id
   * @author  MangoIt Solutions
   * @param   {survey Id, User Id}
   * @return  {Array Of Object}
   */
  getVoteAnswer() {
    const surveyId = this.data['survey'].id;
    this.authService.memberSendRequest('get', 'surveyResultDetails/' + 'survey/' + surveyId + '/userId/' + this.userDetails.userId, null).subscribe((respData: any) => {
      if (respData['isError'] == false) {
        this.vote_answer = respData['result'];
        this.voteAnswer = this.vote_answer[0];
        if (this.vote_answer) {
          if (this.vote_answer?.length > 0) {
            this.vote_answer?.forEach(element => {
              if (this.surveyData?.surveyOption == 0) {
                var inputs: NodeListOf<Element> = document.querySelectorAll('.input-radio');
                if (this.surveyData && this.surveyData?.surveyAnswer && this.surveyData?.surveyAnswer.length > 0) {
                  this.surveyData?.surveyAnswer.forEach((elem: any, index: any) => {
                    if (element.surveyAnswerId == elem.id) {
                      $(inputs[index]).prop('checked', true);
                      this.surveyAnswerId.push(element.surveyAnswerId);
                    }
                  });
                }
              } else if (this.surveyData?.surveyOption == 1) {
                var inputs: NodeListOf<Element> = document.querySelectorAll('.input-checkbox');
                if (this.surveyData && this.surveyData?.surveyAnswer && this.surveyData?.surveyAnswer.length > 0) {
                  this.surveyData.surveyAnswer.forEach((elem: any, index: any) => {
                    if (element.surveyAnswerId == elem.id) {
                      $(inputs[index]).prop('checked', true);
                      this.surveyAnswerId.push(element.surveyAnswerId);
                    }
                  });
                }
              }
            });
          }
          this.surveyVoteForm.value['surveyAnswerId'] = this.surveyAnswerId;
        }
      }
    });
  }

  /**
   * Function is used to save user vote
   * @author  MangoIt Solutions
   * @param   {form data}
   * @return  {string} success message
   */
  errorAnswer: { isError: boolean; errorMessage: string } = { isError: false, errorMessage: '' };
  serveyProcess() {
    const surveyId = this.data['survey'].id;
    if (this.surveyAnswerId && this.surveyAnswerId.length < 1) {
      this.errorAnswer = { isError: true, errorMessage: this.language.Survey.answer_option };
    } else {
      this.btnDisable = 'true';
      this.errorAnswer = { isError: false, errorMessage: '' };
      if (this.surveyVoteForm.valid && !this.errorAnswer.isError) {
        this.authService.setLoader(true);
        this.surveyVoteForm.controls['surveyType'].setValue(this.surveyData?.surveyType);
        this.surveyVoteForm.controls['user_id'].setValue(this.userDetails.userId);
        this.surveyVoteForm.controls['team_id'].setValue(this.surveyData?.team_id);
        this.surveyVoteForm.controls['surveyTypeId'].setValue(this.surveyData?.surveyTypeId);
        this.surveyVoteForm.controls['surveyOption'].setValue(this.surveyData?.surveyOption);
        if (this.surveyData && this.surveyData?.survey_type) {
          this.surveyTypeId = [];
          if (this.surveyData && this.surveyData?.survey_type.length > 0) {
            this.surveyData?.survey_type.forEach(element => {
              this.surveyTypeId.push(element.surveyTypeId);
            });
          }
          this.surveyVoteForm.value.surveyTypeId = this.surveyTypeId;
        } else {
          this.surveyVoteForm.value.surveyTypeId = null;
        }

        if (this.vote_answer && this.vote_answer.length > 0) {
          if (this.surveyAnswerId) {
            this.surveyVoteForm.value.survey_AnswerId = this.surveyAnswerId;
          }
          this.authService.memberSendRequest('put', 'surveyVotesUpdate/' + surveyId, this.surveyVoteForm.value).subscribe((respData: any) => {
            this.authService.setLoader(false);
            if (respData['isError'] == false) {
              this.notificationService.showSuccess(respData['result']['message'], 'Success');
              this.getVoteAnswer();
              this.showVoteResult = true;
            } else if (respData['code'] == 400) {
              this.btnDisable = 'false';
              this.notificationService.showError(respData['message'], 'Error');
            }
          });
        } else {
          if (this.surveyAnswerId) {
            this.surveyVoteForm.value.surveyAnswerId = this.surveyAnswerId;
          }
          this.surveyVoteForm.value.surveyId = this.surveyData?.id;
          this.authService.setLoader(true);
          this.authService.memberSendRequest('post', 'surveyVotes', this.surveyVoteForm.value).subscribe((respData: any) => {
            this.authService.setLoader(false);
            if (respData['isError'] == false) {
              this.notificationService.showSuccess(respData['result']['message'], 'Success');
              this.getVoteAnswer();

              this.showVoteResult = true;
            } else if (respData['code'] == 400) {
              this.btnDisable = 'false';
              this.notificationService.showError(respData['message'], 'Error');
            }
          });
        }
      }
    }
  }

  onradioChange(e: Event) {
    if (e.target['checked']) {
      this.surveyAnswerId[0] = e.target['value'];
    }
  }

  onCheckboxChange(e: Event) {
    if (e.target['checked']) {
      this.surveyAnswerId.push(e.target['value']);
    } else {
      let i: number = 0;
      if (this.surveyAnswerId && this.surveyAnswerId.length > 0) {
        this.surveyAnswerId.forEach((item: any) => {
          if (item == e.target['value']) {
            this.surveyAnswerId.splice(i, 1);
            return;
          }
          i++;
        });
      }
    }
  }

  close(val: any) {
    this.dialogRef.close(val);
  }

  showVote(vote: any) {
    if (vote.surveyViewOption == 0) {
      if (this.userRole == 'admin') {
        return true;
      } else {
        return true;
      }
    } else if (vote.surveyViewOption == 2) {
      if (this.userRole == 'admin') {
        return true;
      } else {
        return false;
      }
    } else if (vote.surveyViewOption == 1) {
      if (this.userRole == 'admin') {
        return true;
      } else {
        if (this.vote_answer && this.vote_answer.length > 0) {
          return true;
        } else {
          return false;
        }
      }
    }
  }

  checkMyVote() {
    const results = this.surveyData?.surveyResult.filter(item => item.user_id === this.userDetails.userId);
    if (results.length > 0) {
      return false;
    } else {
      return true;
    }
  }

  /**
   * Function is used to get how many user choose slected answer
   * @author  MangoIt Solutions
   * @param   {surevy Id, Answer Id}
   * @return  {array object}
   */
  getAnswerResult(ans_id: number) {
    const surveyId = this.data['survey'].id;
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', 'surveyResult/' + 'survey/' + surveyId + '/answerId/' + ans_id, null).subscribe((respData: any) => {
      this.authService.setLoader(false);
      if (respData['isError'] == false) {
        this.vote_setting = respData['result']['result'];
        this.surveyAnswerName = respData['result']['SurveyAnswer'][0].surveyAnswer;
        this.voteCount = this.vote_setting.length;
      }
    });
  }

  /**
   * Function to navigate to previous task
   * @author  MangoIt Solutions
   * @param   {subTaskid}
   * @return  {}
   */
  navigateToPreviousTask() {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
      this.updateSurveyDetails();
    }
  }

  /**
   *Function to navigate to next task
   * @author  MangoIt Solutions
   * @param   {subTaskid}
   * @return  {}
   */
  navigateToNextTask() {
    if (this.selectedIndex < this.surveys.length - 1) {
      this.selectedIndex++;
      this.updateSurveyDetails();
    }
  }

  private updateSurveyDetails() {
    this.surveyData = this.surveys[this.selectedIndex];
    this.getVoteResult(this.surveyData?.id);
  }
}
