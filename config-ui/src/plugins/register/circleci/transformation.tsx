/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { CaretRightOutlined } from '@ant-design/icons';
import { theme, Collapse, Tag, Input } from 'antd';

import { ShowMore, ExternalLink, HelpTooltip } from '@/components';
import { CheckMatchedItems } from '@/plugins';
import { DOC_URL } from '@/release';

import { WorkflowRun } from './workflow-run';

interface Props {
  plugin: string;
  connectionId: ID;
  entities: string[];
  transformation: any;
  setTransformation: React.Dispatch<React.SetStateAction<any>>;
}

export const CircleCITransformation = ({
  plugin,
  connectionId,
  entities,
  transformation,
  setTransformation,
}: Props) => {
  const { token } = theme.useToken();

  const panelStyle: React.CSSProperties = {
    marginBottom: 24,
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: 'none',
  };

  return (
    <Collapse
      bordered={false}
      defaultActiveKey={['CICD']}
      expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} rev="" />}
      style={{ background: token.colorBgContainer }}
      size="large"
      items={renderCollapseItems({
        plugin,
        connectionId,
        entities,
        panelStyle,
        transformation,
        onChangeTransformation: setTransformation,
      })}
    />
  );
};

const renderCollapseItems = ({
  plugin,
  connectionId,
  entities,
  panelStyle,
  transformation,
  onChangeTransformation,
}: {
  plugin: string;
  connectionId: ID;
  entities: string[];
  panelStyle: React.CSSProperties;
  transformation: any;
  onChangeTransformation: any;
}) =>
  [
    {
      key: 'CICD',
      label: 'CI/CD',
      style: panelStyle,
      children: (
        <>
          <h3 style={{ marginBottom: 16 }}>
            <span>Deployment</span>
            <Tag style={{ marginLeft: 4 }} color="blue">
              DORA
            </Tag>
          </h3>
          <ShowMore
            text={<p>Use Regular Expression to define Deployments to measure DORA metrics.</p>}
            btnText="See how to configure"
          >
            <WorkflowRun />
          </ShowMore>
          <div>Convert a CircleCI Workflow Run as a DevLake Deployment when: </div>
          <div style={{ margin: '8px 0', paddingLeft: 28 }}>
            <span>
              The name of the <strong>CircleCI workflow</strong> or <strong>one of its jobs</strong> matches
            </span>
            <Input
              style={{ width: 200, margin: '0 8px' }}
              placeholder="(?i)(deploy|push-image)"
              value={transformation.deploymentPattern ?? ''}
              onChange={(e) =>
                onChangeTransformation({
                  ...transformation,
                  deploymentPattern: e.target.value,
                  productionPattern: !e.target.value ? '' : transformation.productionPattern,
                })
              }
            />
            <i style={{ color: '#E34040' }}>*</i>
            <HelpTooltip content="CircleCI Workflows: https://circleci.com/docs/workflows/" />
          </div>
          <div style={{ margin: '8px 0', paddingLeft: 28 }}>
            <span>If the name or its branch matches</span>
            <Input
              style={{ width: 200, margin: '0 8px' }}
              placeholder="(?i)(prod|release)"
              disabled={!transformation.deploymentPattern}
              value={transformation.productionPattern ?? ''}
              onChange={(e) =>
                onChangeTransformation({
                  ...transformation,
                  productionPattern: e.target.value,
                })
              }
            />
            <span>, this deployment will be regarded as a ‘Production Deployment’</span>
            <HelpTooltip content="If you leave this field empty, all DevLake Deployments will be tagged as in the Production environment." />
          </div>
          <CheckMatchedItems plugin={plugin} connectionId={connectionId} transformation={transformation} />
        </>
      ),
    },
    {
      key: 'ADDITIONAL',
      label: 'Additional Settings',
      style: panelStyle,
      children: (
        <>
          <p>
            Enable the <ExternalLink link={DOC_URL.PLUGIN.REFDIFF}>RefDiff</ExternalLink> plugin to pre-calculate
            version-based metrics
            <HelpTooltip content="Calculate the commits diff between two consecutive tags that match the following RegEx. Issues closed by PRs which contain these commits will also be calculated. The result will be shown in table.refs_commits_diffs and table.refs_issues_diffs." />
          </p>
          <div className="refdiff">
            Compare the last
            <Input
              style={{ margin: '0 8px', width: 60 }}
              placeholder="10"
              value={transformation.refdiff?.tagsLimit ?? ''}
              onChange={(e) =>
                onChangeTransformation({
                  ...transformation,
                  refdiff: {
                    ...transformation?.refdiff,
                    tagsLimit: +e.target.value,
                  },
                })
              }
            />
            tags that match the
            <Input
              style={{ margin: '0 8px', width: 200 }}
              placeholder="(regex)$"
              value={transformation.refdiff?.tagsPattern ?? ''}
              onChange={(e) =>
                onChangeTransformation({
                  ...transformation,
                  refdiff: {
                    ...transformation?.refdiff,
                    tagsPattern: e.target.value,
                  },
                })
              }
            />
            for calculation
          </div>
        </>
      ),
    },
  ].filter((it) => entities.includes(it.key) || it.key === 'ADDITIONAL');
