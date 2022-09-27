import React, { useEffect, useState } from 'react';
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { InputField, ModalWrapper, TitleWithContent, Textarea } from '@/components';
import * as Styled from './SmsSendModalDialog.styled';
import * as api from '@/api';
import { $me, $modalByStorage, ModalKey } from '@/store';
import ApplicationStatusBadge, {
  ApplicationConfirmationStatus,
  ApplicationConfirmationStatusKeyType,
  ApplicationResultStatus,
  ApplicationResultStatusKeyType,
} from '@/components/common/ApplicationStatusBadge/ApplicationStatusBadge.component';
import ArrowRight from '@/assets/svg/chevron-right-16.svg';
import { request, uniqArray } from '@/utils';
import { useToast } from '@/hooks';
import { ToastType } from '../Toast/Toast.component';
import { PATH } from '@/constants';
import { ApplicationResponse } from '@/types';

interface FormValues {
  name: string;
  content: string;
}

export interface SmsSendModalDialogProps {
  selectedApplications: ApplicationResponse[];
  isSendFailed?: boolean;
  messageContent?: string;
  showSummary?: boolean;
}

const SmsSendModalDialog = ({
  selectedApplications,
  isSendFailed = false,
  messageContent,
  showSummary = false,
}: SmsSendModalDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const selectedIds = selectedApplications.map((application) => application.applicant.applicantId);
  const selectedResults = uniqArray(
    selectedApplications.map((application) => application.result.status),
  ) as ApplicationResultStatusKeyType[];
  const selectedConfirmStatuses = uniqArray(
    selectedApplications.map((application) => application.confirmationStatus),
  ) as ApplicationConfirmationStatusKeyType[];

  const { handleAddToast } = useToast();
  const navigate = useNavigate();
  const { adminMember } = useRecoilValue($me);
  const setSmsSendDetailListModal = useSetRecoilState(
    $modalByStorage(ModalKey.smsSendDetailListModalDialog),
  );

  const handleOpenSmsSendDetailListModalDialog = () => {
    setSmsSendDetailListModal({
      key: ModalKey.smsSendDetailListModalDialog,
      props: {
        selectedApplications,
      },
      isOpen: true,
    });
  };

  const handleRemoveCurrentModal = useRecoilCallback(({ set }) => () => {
    set($modalByStorage(ModalKey.smsSendModalDialog), {
      key: ModalKey.smsSendModalDialog,
      isOpen: false,
    });
  });

  const { setValue, handleSubmit, register } = useForm<FormValues>();

  useEffect(() => {
    if (isSendFailed && messageContent) {
      setValue('content', messageContent);
    }
  }, [isSendFailed, messageContent, setValue]);

  const handleSendSms = useRecoilCallback(({ set }) => ({ content, name }: FormValues) => {
    set($modalByStorage(ModalKey.alertModalDialog), {
      key: ModalKey.alertModalDialog,
      isOpen: true,
      props: {
        heading: '발송하시겠습니까?',
        paragraph: 'SMS 발송내역에서 확인하실 수 있습니다.',
        confirmButtonLabel: '발송',
        handleClickConfirmButton: () => {
          request({
            requestFunc: async () => {
              setIsLoading(true);
              await api.postSmsSend({ applicantIds: selectedIds, content, name });
            },

            errorHandler: handleAddToast,
            onSuccess: () => {
              handleRemoveCurrentModal();
              handleAddToast({
                type: ToastType.success,
                message: 'SMS 발송 완료',
              });
              navigate(PATH.SMS);
            },
            onCompleted: () => {
              setIsLoading(false);
              set($modalByStorage(ModalKey.alertModalDialog), {
                key: ModalKey.alertModalDialog,
                isOpen: false,
              });
            },
          });
        },
      },
    });
  });

  const props = {
    heading: isSendFailed ? '실패인원 SMS 재발송' : 'SMS 발송',
    footer: {
      cancelButton: {
        label: '취소',
      },
      confirmButton: {
        label: '발송',
        onClick: handleSubmit(handleSendSms),
        type: 'submit',
        isLoading,
      },
    },
    handleCloseModal: handleRemoveCurrentModal,
    closeOnClickOverlay: false,
  };

  return (
    <ModalWrapper {...props}>
      <Styled.SmsSendModalContainer>
        {showSummary && (
          <>
            <Styled.TitleArea>
              <TitleWithContent title="총 발송 인원">{selectedIds.length}</TitleWithContent>
              {!isSendFailed && (
                <button type="button" onClick={handleOpenSmsSendDetailListModalDialog}>
                  발송 인원 상세보기
                  <ArrowRight />
                </button>
              )}
            </Styled.TitleArea>
            {!isSendFailed && (
              <Styled.TitleArea>
                <TitleWithContent title="발송번호">{adminMember.phoneNumber}</TitleWithContent>
              </Styled.TitleArea>
            )}
            <Styled.StatusArea isSendFailed={isSendFailed}>
              <TitleWithContent title="사용자 확인 여부">
                {selectedConfirmStatuses?.map((each) => (
                  <ApplicationStatusBadge key={each} text={ApplicationConfirmationStatus[each]} />
                ))}
              </TitleWithContent>
              <TitleWithContent title="합격 여부">
                {selectedResults?.map((each) => (
                  <ApplicationStatusBadge key={each} text={ApplicationResultStatus[each]} />
                ))}
              </TitleWithContent>
            </Styled.StatusArea>
            <Styled.Divider />
          </>
        )}
        <InputField
          required
          $size="xs"
          label="발송메모"
          placeholder="내용을 입력해주세요"
          {...register('name', { required: true })}
        />
        <Textarea
          className="textarea"
          required
          label="발송메세지"
          placeholder="내용을 입력해주세요"
          {...register('content', { required: true })}
          disabled={isSendFailed}
        />
      </Styled.SmsSendModalContainer>
    </ModalWrapper>
  );
};

export default SmsSendModalDialog;