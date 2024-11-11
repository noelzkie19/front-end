/* eslint-disable react-hooks/exhaustive-deps */
import React, {FC, createContext, useContext, useEffect, useState} from 'react'
import {useParams} from 'react-router-dom'
import {pageTitle} from '../../../app/constants/Constants'


export interface PageLink {
  title: string
  path: string
  isActive: boolean
  isSeparator?: boolean
}

export interface PageDataContextModel {
  pageTitle?: string
  setPageTitle: (_title: string) => void
  pageDescription?: string
  setPageDescription: (_description: string) => void
  pageBreadcrumbs?: Array<PageLink>
  setPageBreadcrumbs: (_breadcrumbs: Array<PageLink>) => void
}

const PageDataContext = createContext<PageDataContextModel>({
  setPageTitle: (_title: string) => { },
  setPageBreadcrumbs: (_breadcrumbs: Array<PageLink>) => { },
  setPageDescription: (_description: string) => { },
})


const PageDataProvider: React.FC = ({ children }) => {
  const [pageTitle, setPageTitle] = useState<string>('')
  const [pageDescription, setPageDescription] = useState<string>('')
  const [pageBreadcrumbs, setPageBreadcrumbs] = useState<Array<PageLink>>([])
  const value: PageDataContextModel = {
    pageTitle,
    setPageTitle,
    pageDescription,
    setPageDescription,
    pageBreadcrumbs,
    setPageBreadcrumbs,
  }
  return <PageDataContext.Provider value={value}>{children}</PageDataContext.Provider>
}

function usePageData() {
  return useContext(PageDataContext)
}

function setDocumentTitle(children: string, id: number, ticketCode: string, description: string = "") {
      switch (children) {
        case pageTitle.AgentWorkspace:
        case pageTitle.SearchCaseAndCommunication:
        case pageTitle.UserList:
        case pageTitle.CreateUser:
        case pageTitle.ManageTelegramBOT:
        case pageTitle.SearchLeads:
        case pageTitle.SearchBroadcast:
        case pageTitle.SearchTicket:
        case pageTitle.AddTicket:
        case pageTitle.ReMDistribution:
        case pageTitle.ReMProfile:
        case pageTitle.ReMSetting:
        case pageTitle.ReMAutoDistributionSetting:
        case pageTitle.StaffPerformanceSetting:
        case pageTitle.SearchCommunicationReviewReport:
        case pageTitle.OperatorList:
        case pageTitle.CreateOperator:
        case pageTitle.EditOperator:
        case pageTitle.CodeList:
        case pageTitle.SurveyQuestionList:
        case pageTitle.EditSurveyQuestion:
        case pageTitle.SurveyTemplateList:
        case pageTitle.EditSurveyTemplate:
        case pageTitle.PlayerConfiguration:
        case pageTitle.PostChatSurvey:
        case pageTitle.SkillMapping:
        case pageTitle.TeamList:
        case pageTitle.CreateTeam:
        case pageTitle.EditTeam:
        case pageTitle.RoleList:
        case pageTitle.CreateRole:
        case pageTitle.EditRole:
        case pageTitle.PlayerProfile:
        case pageTitle.CreateCase:
        case pageTitle.AddCommunication:
        case pageTitle.CallListValidation:
        case pageTitle.AgentMonitoring:
        case pageTitle.SurveyAndFeedback:
        case pageTitle.CampaignPerformance:
        case pageTitle.PlayerList:
        case pageTitle.Segmentation:
        case pageTitle.EditCase:
          document.title = children.toString();
          break;
        case pageTitle.ViewCase:
        case pageTitle.PCS_Questionnaires:
          document.title = children.toString();
          break;
        case pageTitle.FlyFone:
          document.title = children.toString();
          break;
        case pageTitle.EditCommunication:
          document.title = children.toString();
          break;

        case pageTitle.EditUser:
          document.title = children.toString() + ' | ' + id.toString();
          break;

        case pageTitle.ViewTicket:
        case pageTitle.EditTicket:
          document.title = description ? ticketCode + ' | ' + description : pageTitle.DefaultTitle;
          break;

        case pageTitle.PaymentMethod:
        case pageTitle.VipLevel:
        case pageTitle.RiskLevel:
        case pageTitle.PaymentGroup:
        case pageTitle.Currency:
        case pageTitle.MarketingChannel:
        case pageTitle.Portal:
        case pageTitle.Language:
        case pageTitle.PlayerStatus:
        case pageTitle.Country:
          document.title = pageTitle.PlayerConfiguration.toString();
          break;

        case pageTitle.CommunicationReviewPeriod:
        case pageTitle.CommunicationReviewBenchmark:
        case pageTitle.CommunicationReviewRanking:
        case pageTitle.CommunicationReviewCriteria:
        case pageTitle.CommunicationReviewMeasurement:
          document.title = pageTitle.StaffPerformanceSetting.toString();
          break;

        case pageTitle.Topic:
        case pageTitle.Subtopic:
        case pageTitle.MessageType:
        case pageTitle.MessageStatus:
        case pageTitle.MessageResponse:
        case pageTitle.FeedbackType:
        case pageTitle.FeedbackCategory:
          document.title = pageTitle.CodeList.toString();
          break;

        case pageTitle.ContactLogSummary:
          document.title = pageTitle.ViewContactDetails.toString();
          break; 

        default:
          document.title = pageTitle.DefaultTitle;
          break;
      }
  }


type Props = {
  description?: string
  breadcrumbs?: Array<PageLink>
  dynamicBreadCrumbs?:  Array<PageLink>
}

const PageTitle: FC<Props> = ({ children, description, breadcrumbs, dynamicBreadCrumbs }) => {
  const { id, ticketCode }: { id: number, ticketCode: string } = useParams();
  const { setPageTitle, setPageDescription, setPageBreadcrumbs } = usePageData()
  useEffect(() => {
    if (children) {
      setPageTitle(children.toString())
      setDocumentTitle(children.toString(), id, ticketCode, description)
    }
    return () => {
      setPageTitle('')
    }
  }, [children, description])

  useEffect(() => {
    if (description) {
      setPageDescription(description)
    }
    return () => {
      setPageDescription('')
    }
  }, [description])

  useEffect(() => {
    if (breadcrumbs && breadcrumbs.length > 0) {
      setPageBreadcrumbs(breadcrumbs)
    }
    return () => {
      setPageBreadcrumbs([])
    }
  }, [breadcrumbs])

  useEffect(() => {
    if (dynamicBreadCrumbs && dynamicBreadCrumbs.length > 0 && children) {
      setPageTitle(children.toString())
      setPageDescription(children.toString())
      setPageBreadcrumbs(dynamicBreadCrumbs)
    }
    return () => {
      setPageBreadcrumbs([])
    }
  },[children,dynamicBreadCrumbs])

  return <></>
}

const PageDescription: React.FC = ({ children }) => {
  const { setPageDescription } = usePageData()
  useEffect(() => {
    if (children) {
      setPageDescription(children.toString())
    }
    return () => {
      setPageDescription('')
    }
  }, [children])
  return <></>
}

export {PageDataProvider, PageDescription, PageTitle, usePageData}

