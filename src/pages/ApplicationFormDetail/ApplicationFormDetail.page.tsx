import React from 'react';
import { useRecoilCallback, useRecoilState, useResetRecoilState } from 'recoil';
import { useNavigate, useParams } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { ApplicationFormSection, ApplicationFormAside } from '@/components';
import * as Styled from './ApplicationFormDetail.styled';

import { ParamId, Question, QuestionKind } from '@/types';

import { $applicationFormDetail } from '@/store/applicationForm';
import { InputSize } from '@/components/common/Input/Input.component';
import * as api from '@/api';
import { useToast, useUnmount } from '@/hooks';
import { request } from '@/utils';
import { PATH } from '@/constants';

interface FormValues {
  questions: Question[];
}

const ApplicationFormDetail = () => {
  const { id } = useParams<ParamId>();

  const navigate = useNavigate();
  const { handleAddToast } = useToast();

  const [{ questions, name, team, createdAt, createdBy, updatedAt, updatedBy }] = useRecoilState(
    $applicationFormDetail({ id: id ?? '' }),
  );

  const resetApplicationFormDetail = useResetRecoilState($applicationFormDetail({ id: id ?? '' }));

  const methods = useForm<FormValues>({ defaultValues: { questions } });

  const handleRemoveQuestion = useRecoilCallback(() => async () => {
    if (!id) {
      return;
    }

    request({
      requestFunc: () => api.deleteApplicationForm(id),
      errorHandler: handleAddToast,
      onSuccess: () => {
        navigate(PATH.APPLICATION_FORM);
      },
    });
  });

  useUnmount(() => {
    resetApplicationFormDetail();
  });

  return (
    <FormProvider {...methods}>
      <Styled.ApplicationFormDetailPage>
        <ApplicationFormSection headline="지원서 설문지 상세" />
        <div>
          <article>
            <Styled.Content>
              <span>지원설문지 문서명</span>
              <span>{name}</span>
            </Styled.Content>
            <Styled.QuestionContent>
              {questions.map((question, index) => {
                const readableIndex = index + 1;

                const props = {
                  label: `${readableIndex}. ${question.content}`,
                  description: question.description,
                  disabled: true,
                  required: question.required,
                };

                return (
                  <li key={question.questionId}>
                    {question.questionType === QuestionKind.multiLineText ? (
                      <Styled.CustomTextarea {...props} placeholder="장문형 텍스트입니다." />
                    ) : (
                      <Styled.CustomInput
                        {...props}
                        $size={InputSize.md}
                        placeholder="단답형 텍스트입니다."
                      />
                    )}
                  </li>
                );
              })}
            </Styled.QuestionContent>
          </article>
          <ApplicationFormAside
            platform={team.name}
            createdAt={createdAt}
            createdBy={createdBy}
            updatedAt={updatedAt}
            updatedBy={updatedBy}
            leftActionButton={{
              text: '삭제',
              onClick: handleRemoveQuestion,
            }}
            rightActionButton={{
              text: '수정',
              onClick: () => navigate(`/application-form/update/${id}`),
            }}
          />
        </div>
      </Styled.ApplicationFormDetailPage>
    </FormProvider>
  );
};

export default ApplicationFormDetail;
