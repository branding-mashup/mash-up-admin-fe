import React, { useMemo } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useRecoilValue } from 'recoil';
import {
  Button,
  DatePickerField,
  InputField,
  RadioButtonField,
  SelectField,
  Textarea,
} from '@/components';
import { InputSize } from '@/components/common/Input/Input.component';
import * as Styled from './ScheduleTemplate.styled';
import { $generations, $profile, $teams } from '@/store';
import { SelectOption } from '@/components/common/Select/Select.component';
import { SessionTemplate } from '../SessionTemplate';
import Plus from '@/assets/svg/plus-20.svg';
import { EventCreateRequest } from '@/types';
import { LocationType, ScheduleFormValues, ScheduleType } from '@/utils';
import { useScript } from '@/hooks';

const DEFAULT_SESSION: EventCreateRequest = {
  startedAt: '',
  name: '',
  endedAt: '',
  contentsCreateRequests: [],
};

const DAUM_POSTCODE_SCRIPT = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
const DAUM_POSTCODE_API_URL = 'https://dapi.kakao.com/v2/local/search/address';

const ScheduleTemplate = () => {
  const { register, control, formState, getValues, watch, setValue } =
    useFormContext<ScheduleFormValues>();
  const generations = useRecoilValue($generations);
  const [position] = useRecoilValue($profile);
  const teams = useRecoilValue($teams);

  const locationType = watch('locationType');
  const scheduleType = watch('scheduleType');

  const { fields, append, remove } = useFieldArray({
    name: 'sessions',
    control,
  });

  useScript(DAUM_POSTCODE_SCRIPT);

  const generationOptions = useMemo<SelectOption[]>(() => {
    return generations.map(({ generationNumber }) => ({
      label: `${generationNumber}기`,
      value: generationNumber.toString(),
    }));
  }, [generations]);

  const defaultOption = generationOptions.find(
    (option) => option.value === getValues('generationNumber')?.toString(),
  );

  const generationPlatformOptions = teams.map(({ name }) => ({
    value: name.toUpperCase(),
    label: name,
  }));

  const getTeamSelectOptions = () => {
    const myTeamOptionObject = generationPlatformOptions.find(({ value }) => value === position);
    return myTeamOptionObject ? [myTeamOptionObject] : generationPlatformOptions;
  };

  const teamSelectOptions = getTeamSelectOptions();

  const defaultPlatformOption = generationPlatformOptions.find(
    (option) => option.value === getValues('schedulePlatformType'),
  );

  const handleClickAddressSearch = () => {
    new window.daum.Postcode({
      async oncomplete(data: { address: string }) {
        const res = await fetch(`${DAUM_POSTCODE_API_URL}?query=${data.address}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `KakaoAK ${process.env.KAKAO_KEY}`,
          },
        });
        const json = await res.json();

        const {
          address_name: address,
          x: longitude,
          y: latitude,
          building_name: buildingName,
        } = json.documents[0].road_address;
        const placeName = buildingName || '';

        setValue('locationInfo', {
          roadAddress: address,
          latitude,
          longitude,
          detailAddress: placeName,
        });
      },
    }).open();
  };

  return (
    <>
      <Styled.ScheduleContent>
        <Styled.Title>스케줄 정보</Styled.Title>
        <InputField
          $size={InputSize.md}
          label="스케줄 제목"
          placeholder="내용을 입력해주세요"
          required
          {...register('name', { required: true })}
        />
        <SelectField
          label="기수"
          size="md"
          options={generationOptions}
          defaultValue={defaultOption}
          required
          isFullWidth
          {...register('generationNumber', { required: true })}
        />
        <div>
          <Styled.InputLabel htmlFor="location">
            <span>구분</span>
            <Styled.RequiredDot />
          </Styled.InputLabel>
          <Styled.RadioButtonGroup>
            <RadioButtonField
              label="플랫폼"
              required
              value={ScheduleType.PLATFORM}
              {...register('scheduleType', { required: true })}
            />
            <RadioButtonField
              label="전체"
              required
              value={ScheduleType.ALL}
              {...register('scheduleType', { required: true })}
            />
          </Styled.RadioButtonGroup>
          {scheduleType === ScheduleType.PLATFORM && (
            <SelectField
              size="md"
              options={teamSelectOptions}
              defaultValue={defaultPlatformOption}
              required
              {...register('schedulePlatformType', {
                required: scheduleType === ScheduleType.PLATFORM,
              })}
            />
          )}
        </div>
        <DatePickerField
          label="스케줄 일시"
          $size="md"
          placeholder="내용을 입력해주세요"
          required
          defaultDate={getValues('date')}
          {...register('date', { required: true })}
        />
        <div>
          <Styled.InputLabel htmlFor="location">
            <span>장소</span>
            <Styled.RequiredDot />
          </Styled.InputLabel>
          <Styled.RadioButtonGroup>
            <RadioButtonField
              label="오프라인"
              required
              value={LocationType.OFFLINE}
              {...register('locationType', { required: true })}
            />
            <RadioButtonField
              label="온라인"
              required
              value={LocationType.ONLINE}
              {...register('locationType', { required: true })}
            />
          </Styled.RadioButtonGroup>
          {locationType === LocationType.OFFLINE && (
            <Styled.LocationWrapper>
              <Styled.InputWithButton>
                <InputField
                  $size="md"
                  placeholder="주소"
                  disabled={false}
                  {...register('locationInfo.roadAddress', {
                    required: locationType === LocationType.OFFLINE,
                  })}
                />
                <Button shape="primaryLine" $size="md" onClick={handleClickAddressSearch}>
                  주소 검색
                </Button>
              </Styled.InputWithButton>
              <InputField
                $size="md"
                placeholder="상세 주소를 입력해 주세요 (ex. 동, 호, 층 등)"
                {...register('locationInfo.detailAddress')}
              />
            </Styled.LocationWrapper>
          )}
        </div>
        <Textarea label="공지" {...register('notice')} />
      </Styled.ScheduleContent>
      <Styled.SessionContent>
        <Styled.Title>세션 정보</Styled.Title>
        {fields.map((field, index) => (
          <SessionTemplate
            key={field.id}
            index={index}
            {...field}
            onRemove={remove}
            errors={formState.errors.sessions?.[index]}
          />
        ))}
        <Styled.AddButton type="button" onClick={() => append(DEFAULT_SESSION)}>
          <Plus />
          세션 추가
        </Styled.AddButton>
      </Styled.SessionContent>
    </>
  );
};

export default ScheduleTemplate;
