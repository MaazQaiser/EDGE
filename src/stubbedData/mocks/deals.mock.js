export const dealsData = {
  listing: {
    data: {
      locations: [
        {
          id: 10,
          hubspotLeadId: 'HSID9',
          locationName: null,
          stage: 'Qualified',
          type: 'Strategic',
          franchiseId: 8,
          companyName: 'Company 4',
          industry: 'Industry 12',
          companyAmount: 4288563,
          assignedUserId: null,
          city: 'Brevig Mission',
          state: 'Florida',
          country: 'United States',
          postalCode: 10009,
          address: '9 Main Street',
        },
      ],
    },
    pagination: {
      currentPage: 1,
      nextPage: 1,
      prevPage: null,
      totalPages: 1,
      totalCount: 10,
    },
    message: 'success',
    statusCode: 200,
  },
  states: {
    data: {
      states: {
        1: 'Alaska',
        2: 'Alabama',
        3: 'Arkansas',
        4: 'Arizona',
        5: 'California',
        6: 'Colorado',
        7: 'Connecticut',
        8: 'District of Columbia',
        9: 'Delaware',
        10: 'Florida',
        11: 'Georgia',
        12: 'Hawaii',
        13: 'Iowa',
        14: 'Idaho',
      },
    },
    pagination: {},
    message: 'success',
    statusCode: 200,
  },
  cities: {
    data: {
      cities: {
        501: 'Wattsville',
        502: 'Waverly',
        503: 'Weaver',
        504: 'Wedowee',
        505: 'Wellington',
        506: 'Weogufka',
        507: 'West Blocton',
        508: 'Wetumpka',
        509: 'Wilmer',
        510: 'Winfield',
        511: 'Woodland',
        512: 'York',
      },
    },
    pagination: {},
    message: 'success',
    statusCode: 200,
  },
  yearlyStats: {
    data: {
      yearlyStats: {
        dataLabels: [
          'Dec 2022',
          'Jan 2023',
          'Feb 2023',
          'Mar 2023',
          'Apr 2023',
          'May 2023',
          'Jun 2023',
          'Jul 2023',
          'Aug 2023',
          'Sep 2023',
          'Oct 2023',
          'Nov 2023',
        ],
        data: {
          win: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          lost: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        },
        stats: {
          win: 0,
          lost: 1,
        },
      },
    },
    statusCode: 200,
    message: 'success',
  },
  cumulativeStats: {
    data: {
      stats: {
        months: [
          'Nov 2022',
          'Dec 2022',
          'Jan 2023',
          'Feb 2023',
          'Mar 2023',
          'Apr 2023',
          'May 2023',
          'Jun 2023',
          'Jul 2023',
          'Aug 2023',
          'Sep 2023',
          'Oct 2023',
        ],
        values: [35, 38, 23, 28, 35, 25, 25, 37, 24, 24, 28, 7],
      },
    },
    statusCode: 200,
    message: 'success',
  },
  questions: {
    data: {
      questions: [
        {
          id: 124,
          questionStatement: "What's your favorite color? (Q1 in Section)",
          required: true,
          instruction: 'instructions',
          updatedBy: null,
          responseType: 8,
          updatedAt: '11/27/2023',
          responseTypeLabel: 'Dropdown',
          optionsAttributes: [
            {
              id: 125,
              optionText: 'Option 1 of Q3',
              points: 10,
            },
            {
              id: 126,
              optionText: 'Option 2 of Q3',
              points: 5,
            },
            {
              id: 127,
              optionText: 'Option 3 of Q3',
              points: 5,
            },
            {
              id: 128,
              optionText: 'Option 4 of Q3',
              points: 5,
            },
            {
              id: 129,
              optionText: 'Option 5 of Q3',
              points: 5,
            },
          ],
          selected: [],
        },
      ],
      totalPoints: 0,
    },
    statusCode: 200,
    message: 'success',
  },
  salesPersons: {
    data: {
      salesPersons: [
        {
          id: 1,
          fullName: 'Sales Person',
        },
        {
          id: 18,
          fullName: 'Saad Latif',
        },
      ],
    },
    statusCode: 200,
    message: 'Fetched successfully.',
  },
  detail: {
    data: {
      location: {
        locationId: 12,
        hubspotLeadId: '2251',
        locationName: '',
        status: 'rejected',
        industry: 'Gambling Casinos',
        locationStage: {
          key: 'qualified',
          value: 'Qualified',
        },
        stepperDetails: [
          {
            name: 'New Location',
            value: 'new_location',
            status: 'completed',
          },
          {
            name: 'Working',
            value: 'working',
            status: 'current',
          },
          {
            name: 'Nurturing',
            value: 'nurturing',
            status: 'pending',
          },
          {
            name: 'Qualified',
            value: 'qualified',
            status: 'pending',
          },
        ],
        type: 'Organic',
        franchiseId: 1,
        franchiseName: '0004 - Los Angeles, CA',
        assignTo: {
          intent: 'sales_person',
          assignedUserId: 148,
          assignedUserName: 'Jamal Predovic',
          assignedSupervisorId: null,
          assignedSupervisorName: null,
        },
        level: null,
        score: 40,
        street: '398 Koch Walk',
        addressLine2: null,
        city: 'Wolf Lake',
        cityId: 'wolf_lake',
        state: 'Michigan',
        stateId: 'MI',
        postalCode: '57955-7506',
        createdBy: 'Hubspot',
        creationDate: '2023-10-12T11:34:42.706Z',
        lastUpdated: '2023-11-16T06:45:09.820Z',
        company: {
          id: 13,
          name: 'Treutel and Sons',
          companyOwner: 'Ahsan Awan',
          contact: '',
          address: '45502 Ankunding Well',
          parentCompany: 'Upton-Willms',
        },
        contact: {
          firstName: 'Ardith Bernier Ardith Bernier Ardith Bernier Ardith Bernier',
          lastName: 'Ardith Bernier Ardith Bernier Ardith Bernier Ardith Bernier',
          email: 'hildegarde_rice@289-test-signal.org',
          jobTitle: 'regethgfh',
          phone: '+3143124',
        },
        deals: [],
        attachments: [],
      },
    },
    statusCode: 200,
    message: 'Fetched successfully.',
  },
  contractDetails: {
    data: {
      contract: {
        details: {
          name: 'Costco Wholesale - Dedicated & Patrol Contract',
          amount: 5910,
          createdAt: '2023-01-01T10:56:49.675Z',
          createdBy: 'Jeff Bezos',
          assignees: [
            {
              name: 'Ahsan Awan',
              title: 'Sales ROR Lead',
              signatureStatus: 'pending',
            },
            {
              name: 'Abdul Rehman Wahlah',
              title: 'Sales React Lead',
              signatureStatus: 'done',
            },
            {
              name: 'Muhammad Rehman',
              title: 'React Tech Lead',
              signatureStatus: 'pending',
            },
          ],
          isEditable: true,
          isPublishable: true,
          isPublished: true,
        },
        servicePlans: {
          services: [
            {
              type: 'patrol',
              billType: 'post_bill',
              officerType: {
                id: 1,
                name: 'Armed Officer',
              },
              reqOfficers: 3,
              startDate: '2023-11-29',
              endDate: '2023-11-30',
              startTime: '13:00',
              endTime: '15:00',
              hourlyRate: 20,
              dutyDays: {
                monday: true,
                tuesday: false,
                wednesday: false,
                thursday: true,
                friday: false,
                saturday: false,
                sunday: false,
              },
              instructions: '<p>Adding test instructions!</p>',
              additionalServices: {
                visitorManagement: true,
                loadManagement: false,
              },
              monthlyTotal: 4400,
              estimatedProfit: 1400,
            },
            {
              type: 'dedicated',
              billType: 'pre_bill',
              officerType: {
                id: 1,
                name: 'Armed Officer',
              },
              numberOfVisits: 2,
              startDate: '2023-11-29',
              endDate: '2023-11-30',
              visits: [
                {
                  startTime: '13:00',
                  endTime: '15:00',
                },
              ],
              pricePerHit: 20, // need to discuss the currency
              dutyDays: {
                monday: true,
                tuesday: false,
                wednesday: false,
                thursday: true,
                friday: false,
                saturday: false,
                sunday: false,
              },
              instructions: '<p>Adding test instructions!</p>',
              monthlyTotal: 4400,
              estimatedProfit: 1400,
            },
          ],
          basePrice: 10,
        },
        // discuss about devices that belong to multiple services
        devices: [
          {
            id: 1,
            name: 'NFC tag',
            slug: 'nfc',
            quantity: 10,
            price: 70,
          },
          {
            id: 2,
            name: 'QR tags',
            slug: 'qr_code',
            quantity: 50,
            price: 1000,
          },
        ],
        paymentTerms: {
          paymentMethod: {
            id: 2,
            name: 'cash',
          },
          billingRecurrence: {
            id: 4,
            name: 'Weekly',
          },
          cycleRefDate: '2023-11-29',
          paymentDate: {
            id: 3,
            name: '15 Days after Invoice',
          },
          annualRateIncrease: 10, // Percentage
          discount: {
            type: 'flat_rate',
            percentage: 10, // Percentage
          },
          taxes: [
            {
              id: 1,
              name: 'General sale tax',
              percentage: 20,
            },
            {
              id: 2,
              name: 'State tax',
              percentage: 30,
            },
          ],
          holidayMultiplier: 1.5, // float, number
        },
        onDemandServices: {
          defaultServices: [
            {
              title: 'Dispatch Request',
              description: [
                'What is a dispatch request.',
                'How soon officer can respond.',
                'Types of dispatch.',
              ],
              regular: {
                timeFrame: 'within 4 hrs',
                hourlyRate: 25,
              },
              critical: {
                timeFrame: 'within 2 hrs',
                hourlyRate: 40,
              },
              urgent: {
                timeFrame: 'within 1 hr',
                hourlyRate: 60,
              },
            },
            {
              title: 'Extra Shift',
              description: ['What is extra shift.', 'How many days earlier you need to perform.'],
              regular: {
                timeFrame: '2-6 days before',
                hourlyRate: 25,
              },
              critical: {
                timeFrame: '1 day before',
                hourlyRate: 40,
              },
              urgent: {
                timeFrame: '4 hrs before',
                hourlyRate: 60,
              },
            },
          ],
          additionalServices: [
            {
              title: 'Remote Monitoring',
              price: 50,
              quantity: 10,
              occurence: {
                id: 1,
                name: '150', //amount - price
              },
            },
          ],
        },
        description: {
          service: '<p>Service description!</p>',
          devices: '<p>devices description!</p>',
          paymentTerms: '<p>payment Terms description!</p>',
          demandServices: '<p>demand Services description!</p>',
        },
        configuration: [
          {
            signee: 'Name 01',
            signature: null,
            data: '2023-11-29',
            title: 'CEO',
            email: 'test@test.com',
          },
          {
            signee: 'Name 02',
            signature: null,
            data: '2023-12-30',
            title: 'CTO',
            email: 'test02@test.com',
          },
        ],
        steps: [
          {
            name: 'Add service',
            value: 'service',
            status: 'current',
          },
          {
            name: 'Devices',
            value: 'devices',
            status: 'pending',
          },
          {
            name: 'Payment Terms',
            value: 'paymentTerms',
            status: 'pending',
          },
          {
            name: 'On demand services',
            value: 'demandServices',
            status: 'pending',
          },
          {
            name: 'Description',
            value: 'description',
            status: 'pending',
          },
          {
            name: 'Configuration',
            value: 'configuration',
            status: 'pending',
          },
        ],
      },
    },
    statusCode: 200,
  },
};
